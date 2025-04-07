import log from 'electron-log';
import i18next from 'i18next';
import AppConfig from '../../../../config/AppConfigModule';
import { Project } from '../../../workspace/Project';
import { Scanner } from '../types';
import { ScannerStage } from '../../../../api/types';
import { modelProvider } from '../../../services/ModelProvider';
import { AddCryptographyTask } from '../../cryptography/AddCryptographyTask';
import { componentHelper } from '../../../helpers/ComponentHelper';
import { exportControlService } from '../../../services/ExportControlService';

export class ExportControlTask implements Scanner.IPipelineTask {
  private project: Project;

  constructor(project: Project) {
    this.project = project;
  }

  public getStageProperties():Scanner.StageProperties {
    return {
      name: ScannerStage.EXPORT_CONTROL,
      label: i18next.t('Title:AnalyzingCryptography'),
      isCritical: false,
    };
  }

  public async run():Promise<boolean> {
    log.info('[ Export Control init ]');
    if (!AppConfig.FF_ENABLE_SCAN_CRYPTOGRAPHY) return false;

    const detectedComponents = await modelProvider.model.component.getAll(null);
    const dependencyComponents = await modelProvider.model.dependency.getAll(
      null,
    );
    const components = componentHelper.groupComponentByPurlVersion(
      detectedComponents,
      dependencyComponents,
    );

    const token = this.project.getApiKey();
    const exportControl = await exportControlService.getExportControl(token, components);
    this.project.save();

    return true;
  }
}
