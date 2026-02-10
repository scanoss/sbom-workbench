import log from 'electron-log';
import { IpcChannels } from '../../../../api/ipc-channels';
import { Scanner, StageWarning } from '../types';
import { broadcastManager } from '../../../broadcastManager/BroadcastManager';
import { Project } from '../../../workspace/Project';
import { ITask } from '../../Task';
import { ScanState } from '../../../../api/types';

export abstract class ScannerPipeline implements ITask<Project, boolean> {
  protected queue: Array<Scanner.IPipelineTask>;

  protected warnings: StageWarning[];

  public constructor() {
    this.queue = [];
    this.warnings = [];
  }

  /**
   * Adds a warning to be reported at the end of the scan
   * Use this to collect non-critical errors that shouldn't stop the pipeline
   */
  public addWarning(warning: StageWarning): void {
    this.warnings.push(warning);
  }

  /**
   * Returns all collected warnings
   */
  public getWarnings(): StageWarning[] {
    return this.warnings;
  }

  /**
   * Clears all collected warnings
   */
  protected clearWarnings(): void {
    this.warnings = [];
  }

  public abstract run(params: Project): Promise<boolean>;

  protected async executeTask(task: Scanner.IPipelineTask, stageStep = 1): Promise<boolean> {
    const stageProps = task.getStageProperties();
    try {
      broadcastManager.get().send(IpcChannels.SCANNER_UPDATE_STAGE, {
        stageName: stageProps.name,
        stageLabel: stageProps.label,
        stageStep: `${stageStep + 1}/${this.queue.length}`,
      });
      return await task.run();
    } catch (e: any) {
      if (stageProps.isCritical) {
        log.error('[SCANNER PIPELINE ERROR]', `Stage: ${stageProps.label} error: ${e.message}`);
        broadcastManager.get().send(IpcChannels.SCANNER_ERROR_STATUS, {
          name: `Error: ${stageProps.label}`,
          cause: e,
        });
        throw e;
      }
      log.warn(`Stage: ${stageProps.label} error: ${e.message}`);
      if(stageProps.warnings) this.addWarning(stageProps.warnings);
      return true; // Non-critical task failed, continue pipeline
    }
  }

  protected async done(project: Project) {
    project.metadata.setScannerState(ScanState.FINISHED);
    project.save();
    await project.close();

    // Send warnings via dedicated channel if there are any
    if (this.warnings.length > 0) {
      broadcastManager.get().send(IpcChannels.SCANNER_WARNINGS, {
        warnings: this.warnings,
      });
    }

    broadcastManager.get().send(IpcChannels.SCANNER_FINISH_SCAN, {
      success: true,
      resultsPath: project.metadata.getWorkRoot(),
    });
  }
}
