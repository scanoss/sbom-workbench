import log from 'electron-log';
import { ScannerStage, ScanState } from '../../../api/types';
import { licenseService } from '../../services/LicenseService';
import { modelProvider } from '../../services/ModelProvider';
import { rescanService } from '../../services/RescanService';
import { BaseScannerTask } from './BaseScannerTask';
import { Scanner } from './types';

export class ReScanTask extends BaseScannerTask {
  public getStageProperties(): Scanner.StageProperties {
    return {
      name: ScannerStage.RESCAN,
      label: 'Rescanning',
      isCritical: true,
    };
  }

  public async done() {
    await this.project.open();
    const resultPath = `${this.project.getMyPath()}/result.json`;
    await rescanService.reScan(
      this.project.getTree().getRootFolder().getFiles(),
      resultPath,
      this.project.getMyPath()
    );
    const results = await rescanService.getNewResults();
    this.project.getTree().sync(results);
    this.project.metadata.setScannerState(ScanState.FINISHED);
    log.info(`%c[ SCANNER ]: Re-scan finished `, 'color: green');
    this.project.save();
  }

  public async set(): Promise<void> {
    await this.project.upgrade();
    this.project.metadata.setScannerState(ScanState.RESCANNING);
    await modelProvider.init(this.project.getMyPath());
    await licenseService.import();
    this.project.save();
  }
}
