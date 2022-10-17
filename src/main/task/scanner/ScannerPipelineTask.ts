import { log } from 'electron-log';
import { ITask } from '../Task';
import { ScanTask } from './ScanTask';
import { DependencyTask } from './DependencyTask';
import { VulnerabilitiesTask } from './VulnerabilitiesTask';
import { IndexTask } from '../search/indexTask/IndexTask';
import { IpcChannels } from '../../../api/ipc-channels';
import { broadcastManager } from '../../broadcastManager/BroadcastManager';
import { BaseScannerTask } from './BaseScannerTask';
import { ReScanTask } from './ReScanTask';
import { Project } from '../../workspace/Project';
import { Scanner } from './types';
import { ResumeScanTask } from './ResumeScanTask';
import { DecompressTask } from '../decompress/DecompressTask';
import { IndexTreeTask } from '../IndexTreeTask/IndexTreeTask';
import ScannerType = Scanner.ScannerType;

export class ScannerPipelineTask implements ITask<Project, boolean> {

  private queue: Array<Scanner.IPipelineTask>;

  public constructor() {
    this.queue = [];
  }

  public async run(project: Project): Promise<boolean> {
    const { metadata } = project;

    // decompress
    if (metadata.getScannerConfig().type.includes(ScannerType.UNZIP))
       this.queue.push(new DecompressTask(project));

    // index
    if (
      metadata.getScannerConfig().mode === Scanner.ScannerMode.SCAN ||
      metadata.getScannerConfig().mode === Scanner.ScannerMode.RESCAN
    )
      this.queue.push(new IndexTreeTask(project));

    // scan
    const scanTask: BaseScannerTask =
      metadata.getScannerConfig().mode === Scanner.ScannerMode.SCAN
        ? new ScanTask()
        : metadata.getScannerConfig().mode === Scanner.ScannerMode.RESUME
        ? new ResumeScanTask()
        : new ReScanTask();

    if (metadata.getScannerConfig().type.includes(ScannerType.CODE)) {
      await scanTask.set(project);
      await scanTask.init();
      this.queue.push(scanTask);
    }

    // dependencies
    if (metadata.getScannerConfig().type.includes(ScannerType.DEPENDENCIES))
      this.queue.push(new DependencyTask(project));

    // vulnerabilities
    if (metadata.getScannerConfig().type.includes(ScannerType.VULNERABILITIES))
      this.queue.push(new VulnerabilitiesTask(project));

    // search index
    this.queue.push(new IndexTask(project));

    for await (const [index, task] of this.queue.entries()) {
      await this.executeTask(task, index);
    }

    await project.close();

    broadcastManager.get().send(IpcChannels.SCANNER_FINISH_SCAN, {
      success: true,
      resultsPath: metadata.getMyPath(),
    });

    return true;
  }

  private async executeTask(task: Scanner.IPipelineTask, stageStep = 1) {
    try {
      broadcastManager.get().send(IpcChannels.SCANNER_UPDATE_STATUS, {
        stageName: task.getName(),
        stageStep: `${stageStep}/${this.queue.length}`,
      });

      await task.run();
    } catch(e) {
      if (task.isCritical)
        throw e;

        log.error('[ IndexTask init ]');

    };

  }

}
