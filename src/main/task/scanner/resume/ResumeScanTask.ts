import i18next from 'i18next';
import { ScannerStage, ScanState } from '../../../../api/types';
import { Scanner } from '../types';
import { CodeScanTask } from "../scan/CodeScanTask";


export class ResumeScanTask extends CodeScanTask {

  // @Override
  public getStageProperties(): Scanner.StageProperties {
    return {
      name: ScannerStage.RESUME,
      label: i18next.t('Title:Scanning'),
      isCritical: true,
    };
  }


  // @Override
  public async set(): Promise<void> {
    await this.project.open();
    this.project.processedFiles = this.project.filesSummary.include - Object.keys(this.project.filesToScan).length;
    const scanState: ScanState = this.project.metadata.getScannerState();
    if (scanState !== ScanState.SCANNING && scanState !== ScanState.RESCANNING)
      throw new Error('Cannot resume project');
  }
}
