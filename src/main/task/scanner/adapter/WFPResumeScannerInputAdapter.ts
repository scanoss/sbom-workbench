import { ScannerInput } from 'scanoss';
import { IScannerInputAdapter } from './IScannerInputAdapter';
import { Project } from '../../../workspace/Project';

export class WFPResumeScannerInputAdapter implements IScannerInputAdapter {
  async adapterToScannerInput(project: Project, filesToScan: Record<string, string>): Promise<Array<ScannerInput>> {
    const pendingFiles = Object.keys(project.filesToScan);
    const totalFiles = project.getTree().getRootFolder().getFiles().map((fileItem) => fileItem.path);
    const scannedFiles = totalFiles.filter((path) => !pendingFiles.includes(path));

    // @Override
    const scannerInput:Array<ScannerInput> = [{
      fileList: scannedFiles,
      wfpPath: project.getScanRoot(),
    }];
    return scannerInput;
  }
}
