import { ScanState } from '../../../api/types';
import { BaseScannerTask } from './BaseScannerTask';
import { Project } from '../../workspace/Project';
import { modelProvider } from '../../services/ModelProvider';
import { licenseService } from '../../services/LicenseService';

export class ScanTask extends BaseScannerTask {
  getName(): string {
    return this.project.metadata.getScannerState()
  }

  isCritical(): boolean {
    return false;
  }

  public async set(project: Project): Promise<void> {
    this.project = project;
    await modelProvider.init(this.project.getMyPath());
    await licenseService.import();
    project.metadata.setScannerState(ScanState.SCANNING);
    project.save();
  }
}
