import { ScannerPipeline } from './ScannerPipeline';
import { Project } from '../../../workspace/Project';
import log from 'electron-log';
import { ResultFileTreeTask } from '../../importFileResult/ResultFileTreeTask';
import { ComponentImportTask } from '../../ComponentImportation/ComponentImportTask';
import { ResultDependencyTask } from '../../importFileResult/ResultDependencyTask';
import { SetupFileResultImportTask } from '../../importFileResult/SetupFileResultImportTask';

export class ResultFilePipelineTask extends ScannerPipeline {

  public async run(project: Project): Promise<boolean> {
    log.info("[Result File Pipeline Task init]...")

    // Setup
    this.queue.push(new SetupFileResultImportTask(project));

    // Index
    this.queue.push(new ResultFileTreeTask(project));

    // Import component task
    this.queue.push(new ComponentImportTask(project));

    // Dependency
    this.queue.push(new ResultDependencyTask(project));


    for await (const [index, task] of this.queue.entries()) {
      await this.executeTask(task, index);
    }

    await this.done(project);
    return true;
  }
}
