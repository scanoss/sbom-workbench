import { ScannerInput } from 'scanoss';
import { IScannerInputAdapter } from './IScannerInputAdapter';
import { Project } from '../../../workspace/Project';
import { BaseScannerInputAdapter } from './BaseScannerInputAdapter';
import { CollectFilesVisitor } from '../../../workspace/tree/visitor/CollectFilesVisitor';

export class WFPResumeScannerInputAdapter extends BaseScannerInputAdapter implements IScannerInputAdapter {
  constructor(project:Project) {
    super();
    this.project = project;
  }

  async adapterToScannerInput(filesToScan: Record<string, string>): Promise<Array<ScannerInput>> {
    const pendingFiles = Object.keys(this.project.filesToScan);
    const collector = new CollectFilesVisitor();
    this.project.getTree().getRootFolder().accept<void>(collector);
    const totalFiles = collector.files.map((file) => file.getPath());
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
