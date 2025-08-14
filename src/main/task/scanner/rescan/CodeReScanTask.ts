import fs from 'fs';
import { rescanService } from '../../../services/RescanService';
import { RescanTask } from './RescanTask';
import { CodeDispatcher } from '../dispatcher/CodeDispatcher';
import { CodeScannerInputAdapter } from '../adapter/CodeScannerInputAdapter';
import { Project } from '../../../workspace/Project';
import { utilModel } from '../../../model/UtilModel';

export class CodeReScanTask extends RescanTask<CodeDispatcher, CodeScannerInputAdapter> {
  constructor(project: Project) {
    super(project, new CodeDispatcher(), new CodeScannerInputAdapter(project));
  }

  public async reScan(resultPath: string): Promise<void> {
    await rescanService.reScan(this.project.getTree().getRootFolder().getFiles(), resultPath, this.project.getMyPath());
  }
}
