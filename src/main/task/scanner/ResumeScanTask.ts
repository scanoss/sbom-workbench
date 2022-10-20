import { ScannerStage, ScanState } from '../../../api/types';
import { BaseScannerTask } from './BaseScannerTask';
import { Scanner } from './types';

export class ResumeScanTask extends BaseScannerTask {
  public getStageProperties(): Scanner.StageProperties {
    return {
      name: ScannerStage.RESUME,
      label: 'Scanning',
      isCritical: true,
    };
  }

  public async set(): Promise<void> {
    await this.project.open();
    const scanState: ScanState = this.project.metadata.getScannerState();
    if (scanState !== ScanState.SCANNING && scanState !== ScanState.RESCANNING)
      throw new Error('Cannot resume project');
  }
}
