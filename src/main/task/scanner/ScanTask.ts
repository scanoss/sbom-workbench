import { ScanState } from '../../../api/types';
import { BaseScannerTask } from './BaseScannerTask';
import { Project } from '../../workspace/Project';

export class ScanTask extends BaseScannerTask {
  public async set(project: Project): Promise<void> {
    this.project = project;
    project.metadata.setScannerState(ScanState.SCANNING);
    project.save();
  }
}
