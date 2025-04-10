import log from 'electron-log';
import i18next from 'i18next';
import AppConfig from '../../../../config/AppConfigModule';
import { Project } from '../../../workspace/Project';
import { Scanner } from '../types';
import { ScannerStage } from '../../../../api/types';
import { modelProvider } from '../../../services/ModelProvider';
import { AddCryptographyTask } from '../../cryptography/AddCryptographyTask';
import { componentHelper } from '../../../helpers/ComponentHelper';

export class CryptographyTask implements Scanner.IPipelineTask {
  private project: Project;

  private force: boolean;

  constructor(project: Project, force: boolean = false) {
    this.project = project;
    this.force = force;
  }

  public getStageProperties():Scanner.StageProperties {
    return {
      name: ScannerStage.CRYPTOGRAPHY,
      label: i18next.t('Title:AnalyzingCryptography'),
      isCritical: false,
    };
  }

  public async run():Promise<boolean> {
    log.info('[ Cryptography init ]');
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
    const addCryptographyTask = new AddCryptographyTask();
    await addCryptographyTask.run({ components, token, force: this.force });

    this.project.save();

    return true;
  }
}
