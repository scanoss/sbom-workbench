import { ScannerInput } from 'scanoss';
import { IScannerInputAdapter } from './IScannerInputAdapter';
import { Project } from '../../../workspace/Project';
import { BaseScannerInputAdapter } from './BaseScannerInputAdapter';

export class WFPResumeScannerInputAdapter extends BaseScannerInputAdapter implements IScannerInputAdapter {
  constructor(project:Project) {
    super();
    this.project = project;
  }

  async adapterToScannerInput(filesToScan: Record<string, string>): Promise<Array<ScannerInput>> {
    const pendingFiles = Object.keys(this.project.filesToScan);
    const totalFiles = this.project.getTree().getRootFolder().getFiles().map((fileItem) => fileItem.path);
    const scannedFiles = totalFiles.filter((path) => !pendingFiles.includes(path));

    // @Override
    const scannerInput:Array<ScannerInput> = [{
      fileList: scannedFiles,
      wfpPath: this.project.getScanRoot(),
      ...this.getEngineFlags(),
    }];
    return scannerInput;
  }
}
