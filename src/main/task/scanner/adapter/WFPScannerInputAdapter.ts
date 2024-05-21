import { ScannerInput } from 'scanoss';
import { IScannerInputAdapter } from './IScannerInputAdapter';
import { Project } from '../../../workspace/Project';

export class WFPScannerInputAdapter implements IScannerInputAdapter {
  async adapterToScannerInput(project: Project, filesToScan: Record<string, string>): Promise<Array<ScannerInput>> {
    // @Override
    const scannerInput:Array<ScannerInput> = [{
      fileList: [],
      wfpPath: project.getScanRoot(),
    }];
    return scannerInput;
  }
}
