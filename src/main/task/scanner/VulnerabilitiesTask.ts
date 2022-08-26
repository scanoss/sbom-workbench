import log from 'electron-log';
import { ITask } from '../Task';
import { Project } from '../../workspace/Project';
import { broadcastManager } from '../../broadcastManager/BroadcastManager';
import { modelProvider } from '../../services/ModelProvider';
import { IpcChannels } from '../../../api/ipc-channels';
import { Vulnerability } from '../../model/entity/Vulnerability';
import { AddVulneravilityTask } from '../vulnerability/AddVulneravilityTask';

export class VulnerabilitiesTask implements ITask<void, void> {
  private project: Project;

  constructor(project: Project) {
    this.project = project;
  }

  public async run(): Promise<void> {
    log.info('[ VulnerabilitiesTask init ]');
    this.updateStatus();
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

  private updateStatus() {
    broadcastManager.get().send(IpcChannels.SCANNER_UPDATE_STATUS, {
      stage: {
        stageName: `Searching vulnerabilities`,
        stageStep: 4,
      },
      processed: 0,
    });
  }
}
