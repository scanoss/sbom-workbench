import { ITask } from '../Task';
import { Project } from '../../workspace/Project';
import { broadcastManager } from '../../broadcastManager/BroadcastManager';

export class VulnerabilitiesTask implements ITask<void, void> {
  private project: Project;

  constructor(project: Project) {
    this.project = project;
  }

 public async run(params: void): Promise<void> {
    /* broadcastManager.get().send(IpcChannels.SCANNER_UPDATE_STATUS, {
      stage: {
        stageName: `Searching vulnerabilities`,
        stageStep: 4,
      },
      processed: 0,
    }); */
    await this.project.save();
    return Promise.resolve(undefined);
  }
}
