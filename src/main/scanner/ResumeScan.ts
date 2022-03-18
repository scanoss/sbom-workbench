import { ScanState } from '../../api/types';
import { Scan } from './Scan';

export class ResumeScan extends Scan {
  public async scanStateValidation() {
    const scanState: ScanState = this.project.metadata.getScannerState();
    if (scanState !== ScanState.SCANNING && scanState !== ScanState.RESCANNING)
      throw new Error('Cannot resume project');
    await this.project.open();
  }
}
