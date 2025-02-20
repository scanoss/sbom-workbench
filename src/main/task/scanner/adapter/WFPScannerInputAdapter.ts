import { ScannerInput } from 'scanoss';
import { IScannerInputAdapter } from './IScannerInputAdapter';
import { Project } from '../../../workspace/Project';
import { BaseScannerInputAdapter } from './BaseScannerInputAdapter';

export class WFPScannerInputAdapter extends BaseScannerInputAdapter implements IScannerInputAdapter {
  constructor(project:Project) {
    super();
    this.project = project;
  }

  async adapterToScannerInput(filesToScan: Record<string, string>): Promise<Array<ScannerInput>> {
    // @Override
    const scannerInput:Array<ScannerInput> = [{
      fileList: [],
      wfpPath: this.project.getScanRoot(),
      ...this.getEngineFlags(),
    }];
    return scannerInput;
  }
}
