import { IpcEvents } from '../../../api/ipc-events';
import { ScanState } from '../../../api/types';
import { Scan } from './Scan';

export class ResumeScan extends Scan {
  public async scanStateValidation() {
    const scanState: ScanState = this.project.metadata.getScannerState();
    if (scanState !== ScanState.SCANNING && scanState !== ScanState.RESCANNING)
      throw new Error('Cannot resume project');
    await this.project.open();
  }

  public scannerStatus(){
    this.sendToUI(IpcEvents.SCANNER_UPDATE_STATUS, {
      stage: ScanState.SCANNING,
      processed: (100 * this.project.processedFiles) / this.project.filesSummary.include,
    });
  }

}
