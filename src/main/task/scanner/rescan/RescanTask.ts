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
    const result: Record<any, any> = await utilModel.readFile(resultPath);
    for (const [key, value] of Object.entries(result)) {
      if(!key.startsWith("/")) {
        result[`/${key}`] = value;
        delete result[key];
      }
    }
    await fs.promises.writeFile(resultPath,JSON.stringify(result,null,2));
    return result;
  }

  protected async updateStatusFlagsOnFileTree(results: Record<string, any>){
    this.project.tree.attachResults(results);
    this.project.tree.updateFlags();
  }

  public async done() {
    await this.project.open();
    const results = await this.updateResultFile();
    await this.updateStatusFlagsOnFileTree(results);
    await this.reScan(`${this.project.getMyPath()}/result.json`);
    this.project.getTree().updateFlags();
    const newFileStatusResults = await rescanService.getNewResults();
    this.project.getTree().sync(newFileStatusResults);
    this.project.metadata.setScannerState(ScanState.FINISHED);
    log.info('%c[ SCANNER ]: Re-scan finished ', 'color: green');
    this.project.save();
  }
}
