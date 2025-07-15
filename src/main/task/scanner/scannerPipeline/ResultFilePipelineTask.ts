import { ScannerPipeline } from './ScannerPipeline';
import { Project } from '../../../workspace/Project';

import log from 'electron-log';
import { ResultFileTreeTask } from '../../IndexTreeTask/ResultFileTreeTask';
import { ComponentImportTask } from '../../ComponentImportation/ComponentImportTask';
import fs from 'fs';
import path from 'path';

export class ResultFilePipelineTask extends ScannerPipeline {

  public async run(project: Project): Promise<boolean> {
    log.info("[Result File Pipeline Task init]...")
    const { metadata } = project;

    // Index
    this.queue.push(new ResultFileTreeTask(project));

    // Import component task
    this.queue.push(new ComponentImportTask(project));


    for await (const [index, task] of this.queue.entries()) {
      await this.executeTask(task, index);
    }

    await this.done(project);
    return true;
  }
}
