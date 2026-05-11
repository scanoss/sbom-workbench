import log from 'electron-log';
import fs from 'fs';
import { ScannerStage, ScanState } from '../../../../api/types';
import { BaseScannerTask } from '../BaseScannerTask';
import { Scanner, StageReport } from '../types';
import { modelProvider } from '../../../services/ModelProvider';
import { licenseService } from '../../../services/LicenseService';
import { rescanService, RescanSummary } from '../../../services/RescanService';
import { IDispatch } from '../dispatcher/IDispatch';
import { IScannerInputAdapter } from '../adapter/IScannerInputAdapter';
import { fileExists, retryWithBackoff } from '../../../utils/utils';
import { finished } from 'stream/promises';
import { utilModel } from '../../../model/UtilModel';
import { EOL } from 'os';
import { parser } from 'stream-json';
import { streamObject } from 'stream-json/streamers/StreamObject';

export abstract class RescanTask<TDispatcher extends IDispatch, TInputScannerAdapter extends IScannerInputAdapter> extends BaseScannerTask<TDispatcher, TInputScannerAdapter> {
  private rescanReport: StageReport = {
    title: 'Rescan summary',
    stage: ScannerStage.RESCAN,
    entries: [],
  };

  public getStageProperties(): Scanner.StageProperties {
    return {
      name: ScannerStage.RESCAN,
      label: 'Rescanning',
      isCritical: true,
      stageReport: this.rescanReport,
    };
  }

  public abstract reScan(resultsPath: string): Promise<RescanSummary>;

  public async init(): Promise<void> {
    log.info('%c[ SCANNER ]: Rescan started ', 'color: green');
    const resultPath = `${this.project.getMyPath()}/result.json`;
    const wfpPath = `${this.project.getMyPath()}/winnowing.wfp`;
    if (await fileExists(resultPath)) await retryWithBackoff(() => fs.promises.unlink(resultPath));
    if (await fileExists(wfpPath)) await retryWithBackoff(() => fs.promises.unlink(wfpPath));
    await super.init();
  }

  // @Override
  public async set(): Promise<void> {
    await this.project.upgrade();
    this.project.metadata.setScannerState(ScanState.RESCANNING);
    await modelProvider.init(this.project.getMyPath());
    await licenseService.import();
    this.project.save();
  }

  private async updateResultFile(){
    const resultPath = `${this.project.getMyPath()}/result.json`;
    const tempPath = `${this.project.getMyPath()}/result_temp.json`;
    const writeStream = fs.createWriteStream(tempPath);
    const readStream = fs.createReadStream(resultPath);

    // Monitor both streams upfront so errors during the data phase are caught
    const readStreamSettled = finished(readStream);
    const writeStreamSettled = finished(writeStream);

    try {
      writeStream.write(`{${EOL}`); // Start JSON object

      let isFirst = true;
      const pipeline = readStream
        .pipe(parser())
        .pipe(streamObject());

      pipeline.on('data', async ({ key, value }) => {
        // Modify key to ensure it starts with '/'
        const modifiedKey = key.startsWith('/') ? key : `/${key}`;

        // Write to output file
        if (!isFirst) {
          writeStream.write(`,${EOL}`);
        }
        isFirst = false;

        writeStream.write(`  "${modifiedKey}": ${JSON.stringify(value)}`);

        await this.updateStatusFlagsOnFileTree({ [modifiedKey]: value});
      });

      // Wait for pipeline to finish, or either stream to error first
      await Promise.race([finished(pipeline), readStreamSettled, writeStreamSettled]);

      writeStream.end(`${EOL}}`);

      // Wait for both file descriptors to be released
      await Promise.all([readStreamSettled, writeStreamSettled]);

      // Rename with retry for transient sharing-violation errors (AV, SMB close lag)
      await retryWithBackoff(() => fs.promises.rename(tempPath, resultPath));
      log.info('Finished parsing and writing SCANOSS raw results JSON');
    } catch (err) {
      log.error('Error finalizing result.json:', err);
      readStream.destroy();
      writeStream.destroy();
      readStreamSettled.catch(() => undefined);
      writeStreamSettled.catch(() => undefined);
      throw err;
    }
  }

  protected async updateStatusFlagsOnFileTree(results: Record<string, any>){
    this.project.tree.attachResults(results);
    this.project.tree.updateFlags();
  }

  public async done() {
    await this.project.open();
    await this.updateResultFile();
    const { newFiles, modifiedFiles, deletedFiles } = await this.reScan(`${this.project.getMyPath()}/result.json`);
    newFiles.forEach((f) => this.rescanReport.entries.push({ item: f.getPath(), message: 'New file', severity: 'info' }));
    modifiedFiles.forEach((f) => this.rescanReport.entries.push({ item: f.getPath(), message: 'Content changed', severity: 'info' }));
    deletedFiles.forEach((p) => this.rescanReport.entries.push({ item: p, message: 'File deleted', severity: 'info' }));
    const newFileStatusResults = await rescanService.getNewResults();
    this.project.getTree().sync(newFileStatusResults);
    this.project.metadata.setScannerState(ScanState.FINISHED);
    log.info('%c[ SCANNER ]: Re-scan finished ', 'color: green');
    this.project.saveWithSnapshot();
  }
}
