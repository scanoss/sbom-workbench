import i18next from 'i18next';
import fs from 'fs';
import { ScannerStage, ScanState } from '../../../../api/types';
import { BaseScannerTask } from '../BaseScannerTask';
import { Scanner } from '../types';
import { modelProvider } from '../../../services/ModelProvider';
import { licenseService } from '../../../services/LicenseService';
import { IDispatch } from '../dispatcher/IDispatch';
import { IScannerInputAdapter } from '../adapter/IScannerInputAdapter';
import { fileExists } from '../../../utils/utils';

export abstract class ScanTask<TDispatcher extends IDispatch, TInputScannerAdapter extends IScannerInputAdapter> extends BaseScannerTask <TDispatcher, TInputScannerAdapter> {
  public getStageProperties(): Scanner.StageProperties {
    return {
      name: ScannerStage.SCAN,
      label: i18next.t('Title:Scanning'),
      isCritical: true,
    };
  }

  public async set(): Promise<void> {
    await modelProvider.init(this.project.getMyPath());
    await licenseService.import();
    this.project.metadata.setScannerState(ScanState.SCANNING);
  }

  // @Override
  public async init(): Promise<void> {
    if (await fileExists(`${this.project.getMyPath()}/result.json`)) await fs.promises.unlink(`${this.project.getMyPath()}/result.json`);
    if (await fileExists(`${this.project.getMyPath()}/winnowing.wfp`)) await fs.promises.unlink(`${this.project.getMyPath()}/winnowing.wfp`);
    await super.init();
  }
}
