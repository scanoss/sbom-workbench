import log from 'electron-log';
import i18next from 'i18next';
import { ITask } from '../Task';
import { Project } from '../../workspace/Project';
import { broadcastManager } from '../../broadcastManager/BroadcastManager';
import { modelProvider } from '../../services/ModelProvider';
import { IpcChannels } from '../../../api/ipc-channels';
import { AddVulneravilityTask } from '../vulnerability/AddVulneravilityTask';
import AppConfig from '../../../config/AppConfigModule';
import { Scanner } from './types';
import { ScannerStage } from '../../../api/types';

export class VulnerabilitiesTask implements Scanner.IPipelineTask {
  private project: Project;

  constructor(project: Project) {
    this.project = project;
  }

  public getStageProperties(): Scanner.StageProperties {
    return {
      name: ScannerStage.VULNERABILITY,
      label: i18next.t('Title:SearchingVulnerabilities'),
      isCritical: false,
    };
  }

  public async run(): Promise<boolean> {
    if (!AppConfig.FF_ENABLE_SCAN_VULNERABILITY) return false;

    log.info('[ VulnerabilitiesTask init ]');

    const detectedComponents = await modelProvider.model.component.getAll(null);
    const dependencyComponents = await modelProvider.model.dependency.getAll(
      null
    );
    const components = this.groupComponentByPurlVersion(
      detectedComponents,
      dependencyComponents
    );
    const addVulnerability = new AddVulneravilityTask();
    await addVulnerability.run(components);
    this.project.save();
    return true;
  }

  private groupComponentByPurlVersion(
    components: any,
    dependencyComponents: any
  ): Array<string> {
    const allComponents = components.concat(dependencyComponents);
    const componentSet = new Set<string>();
    allComponents.forEach((c) => {
      if (c.purl && c.version) {
        componentSet.add(`${c.purl}@${c.version}`);
      }
    });
    const response = Array.from(componentSet);
    return response;
  }
}
