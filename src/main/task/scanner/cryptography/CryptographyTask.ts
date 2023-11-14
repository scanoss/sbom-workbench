import log from 'electron-log';
import i18next from 'i18next';
import AppConfig from '../../../../config/AppConfigModule';
import { Project } from '../../../workspace/Project';
import { Scanner } from '../types';
import { ScannerStage } from '../../../../api/types';
import { modelProvider } from '../../../services/ModelProvider';
import { AddCryptographyTask } from '../../cryptography/AddCryptographyTask';

export class CryptographyTask implements Scanner.IPipelineTask {
  private project: Project;

  constructor(project: Project) {
    this.project = project;
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
    if (!AppConfig.FF_ENABLE_SCAN_VULNERABILITY) return false;

    log.info('[ VulnerabilitiesTask init ]');

    const detectedComponents = await modelProvider.model.component.getAll(null);
    const dependencyComponents = await modelProvider.model.dependency.getAll(
      null,
    );
    const components = this.groupComponentByPurlVersion(
      detectedComponents,
      dependencyComponents,
    );
    const addCryptographyTask = new AddCryptographyTask();
    await addCryptographyTask.run(components);
    this.project.save();

    return true;
  }

  private groupComponentByPurlVersion(
    components: any,
    dependencyComponents: any,
  ): Array<string> {
    const allComponents = components.concat(dependencyComponents);
    const componentSet = new Set<string>();
    allComponents.forEach((c) => {
      if (c.purl && c.version) {
        componentSet.add(`${c.purl}@${c.version}`);
      }
    });
    return Array.from(componentSet);
  }
}
