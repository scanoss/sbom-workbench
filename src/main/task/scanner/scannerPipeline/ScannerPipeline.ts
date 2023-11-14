import log from 'electron-log';
import { IpcChannels } from '../../../../api/ipc-channels';
import { Scanner } from '../types';
import { broadcastManager } from '../../../broadcastManager/BroadcastManager';
import { Project } from '../../../workspace/Project';
import { ITask } from '../../Task';

export abstract class ScannerPipeline implements ITask<Project, boolean> {
  protected queue: Array<Scanner.IPipelineTask>;

  public constructor() {
    this.queue = [];
  }

  public abstract run(params: Project): Promise<boolean>;

  protected async executeTask(task: Scanner.IPipelineTask, stageStep = 1) {
    try {
      broadcastManager.get().send(IpcChannels.SCANNER_UPDATE_STAGE, {
        stageName: task.getStageProperties().name,
        stageLabel: task.getStageProperties().label,
        stageStep: `${stageStep + 1}/${this.queue.length}`,
      });
      await task.run();
    } catch (e: any) {
      if (task.getStageProperties().isCritical) {
        log.error(
          '[SCANNER PIPELINE ERROR]',
          `Stage: ${task.getStageProperties().label} error: ${e.message}`,
        );
        broadcastManager.get().send(IpcChannels.SCANNER_ERROR_STATUS, {
          name: `Error: ${
            task.getStageProperties().label
          }`,
          cause: e,
        });
        throw e;
      }
    }
  }

  protected async done(project: Project) {
    await project.close();
    broadcastManager.get().send(IpcChannels.SCANNER_FINISH_SCAN, {
      success: true,
      resultsPath: project.metadata.getMyPath(),
    });
  }
}
