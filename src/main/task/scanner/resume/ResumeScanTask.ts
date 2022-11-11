import { ScannerStage, ScanState } from '../../../../api/types';
import { Scanner } from '../types';
import { CodeScanTask } from "../scan/CodeScanTask";
import {CodeDispatcher} from "../dispatcher/CodeDispatcher";
import {CodeScannerInputAdapter} from "../adapter/CodeScannerInputAdapter";

export class ResumeScanTask extends CodeScanTask {

  // @Override
  public getStageProperties(): Scanner.StageProperties {
    return {
      name: ScannerStage.RESUME,
      label: 'Scanning',
      isCritical: true,
    };
  }

  // @Override
  public async set(): Promise<void> {
    await this.project.open();
    const scanState: ScanState = this.project.metadata.getScannerState();
    if (scanState !== ScanState.SCANNING && scanState !== ScanState.RESCANNING)
      throw new Error('Cannot resume project');
  }
}
