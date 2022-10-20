import { ScannerStage, ScanState } from '../../../api/types';
import { BaseScannerTask } from './BaseScannerTask';
import { modelProvider } from '../../services/ModelProvider';
import { licenseService } from '../../services/LicenseService';
import { Scanner } from './types';

export class ScanTask extends BaseScannerTask {
  public getStageProperties(): Scanner.StageProperties {
    return {
      name: ScannerStage.SCAN,
      label: 'Scanning',
      isCritical: true,
    };
  }

  public async set(): Promise<void> {
    await modelProvider.init(this.project.getMyPath());
    await licenseService.import();
    this.project.metadata.setScannerState(ScanState.SCANNING);
  }
}
