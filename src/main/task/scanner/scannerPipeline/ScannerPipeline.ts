import log from 'electron-log';
import { IpcChannels } from '../../../../api/ipc-channels';
import { Scanner, StageReport } from '../types';
import { broadcastManager } from '../../../broadcastManager/BroadcastManager';
import { Project } from '../../../workspace/Project';
import { ITask } from '../../Task';
import { ScanState } from '../../../../api/types';

export abstract class ScannerPipeline implements ITask<Project, boolean> {
  protected queue: Array<Scanner.IPipelineTask>;

  protected stageReports: StageReport[];

  public constructor() {
    this.queue = [];
    this.stageReports = [];
  }

  /**
   * Adds a report to be shown at the end of the scan
   * Use this to collect non-critical errors that shouldn't stop the pipeline
   */
  public addReport(report: StageReport): void {
    this.stageReports.push(report);
  }

  /**
   * Returns all collected reports
   */
  public getReports(): StageReport[] {
    return this.stageReports;
  }

  /**
   * Clears all collected reports
   */
  protected clearReports(): void {
    this.stageReports = [];
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
      const result = await task.run();
      // Tasks may populate a report during a successful run to surface
      // informational messages (e.g. rescan summary) in the end-of-scan dialog.
      if (stageProps.stageReport && stageProps.stageReport.entries.length > 0) {
        this.addReport(stageProps.stageReport);
      }
      return result;
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
      if (stageProps.stageReport) this.addReport(stageProps.stageReport);
      return true; // Non-critical task failed, continue pipeline
    }
  }

  protected async done(project: Project) {
    project.metadata.setScannerState(ScanState.FINISHED);
    let saveError: unknown = null;
    try {
      project.saveWithSnapshot();
    } catch (e) {
      saveError = e;
    } finally {
      await project.close();
    }

    if (saveError) {
      log.error('[SCANNER PIPELINE ERROR]', 'Failed to persist project snapshot', saveError);
      throw saveError;
    }

    // Send stage reports via dedicated channel if there are any
    if (this.stageReports.length > 0) {
      broadcastManager.get().send(IpcChannels.SCANNER_REPORTS, {
        reports: this.stageReports,
      });
    }

    broadcastManager.get().send(IpcChannels.SCANNER_FINISH_SCAN, {
      success: true,
      resultsPath: project.metadata.getWorkRoot(),
    });
  }
}
