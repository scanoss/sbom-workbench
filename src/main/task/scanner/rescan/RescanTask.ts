import log from 'electron-log';
import fs from 'fs';
import { ScannerStage, ScanState } from '../../../../api/types';
import { BaseScannerTask } from '../BaseScannerTask';
import { Scanner } from '../types';
import { modelProvider } from '../../../services/ModelProvider';
import { licenseService } from '../../../services/LicenseService';
import { rescanService } from '../../../services/RescanService';
import { IDispatch } from '../dispatcher/IDispatch';
import { IScannerInputAdapter } from '../adapter/IScannerInputAdapter';
import { fileExists } from '../../../utils/utils';
import { utilModel } from '../../../model/UtilModel';
import { EOL } from 'os';
import { parser } from 'stream-json';
import { streamObject } from 'stream-json/streamers/StreamObject';

export abstract class RescanTask<TDispatcher extends IDispatch, TInputScannerAdapter extends IScannerInputAdapter> extends BaseScannerTask<TDispatcher, TInputScannerAdapter> {
  public getStageProperties(): Scanner.StageProperties {
    return {
      name: ScannerStage.RESCAN,
      label: 'Rescanning',
      isCritical: true,
    };
  }

  public abstract reScan(resultsPath: string): Promise<void>;

  public async init(): Promise<void> {
    log.info('%c[ SCANNER ]: Rescan started ', 'color: green');
    if (await fileExists(`${this.project.getMyPath()}/result.json`)) await fs.promises.unlink(`${this.project.getMyPath()}/result.json`);
    if (await fileExists(`${this.project.getMyPath()}/winnowing.wfp`)) await fs.promises.unlink(`${this.project.getMyPath()}/winnowing.wfp`);
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
    writeStream.write(`{${EOL}`); // Start JSON object

    let isFirst = true;

    const pipeline = fs.createReadStream(resultPath)
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

    await new Promise<void>((resolve, reject) => {
      pipeline.on('end', () => {
        writeStream.write(`${EOL}}`); // Close JSON object
        writeStream.end(() => {
          // Rename temp file to original after write completes
          fs.renameSync(tempPath, resultPath);
          log.info('Finished parsing and writing SCANOSS raw results JSON');
          resolve();
        });
      });

      pipeline.on('error', (err) => {
        writeStream.end();
        log.error('Error:', err);
        reject(err);
      });

      writeStream.on('error', (err) => {
        log.error('Write error:', err);
        reject(err);
      });
    });
  }

  protected async updateStatusFlagsOnFileTree(results: Record<string, any>){
    this.project.tree.attachResults(results);
    this.project.tree.updateFlags();
  }

  public async done() {
    await this.project.open();
    await this.updateResultFile();
    await this.reScan(`${this.project.getMyPath()}/result.json`);
    this.project.getTree().updateFlags();
    const newFileStatusResults = await rescanService.getNewResults();
    this.project.getTree().sync(newFileStatusResults);
    this.project.metadata.setScannerState(ScanState.FINISHED);
    log.info('%c[ SCANNER ]: Re-scan finished ', 'color: green');
    this.project.save();
  }
}
