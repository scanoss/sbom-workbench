import { ITask } from '../Task';
import { Project } from '../../workspace/Project';
import { broadcastManager } from '../../broadcastManager/BroadcastManager';

export class VulnerabilitiesTask implements ITask<void, boolean> {
  private project: Project;

  constructor(project: Project) {
    this.project = project;
  }

  run(params: void): Promise<boolean> {
    /* broadcastManager.get().send(IpcChannels.SCANNER_UPDATE_STATUS, {
      stage: {
        stageName: `Searching vulnerabilities`,
        stageStep: 4,
      },
      processed: 0,
    }); */
    return Promise.resolve(undefined);
  }
}
