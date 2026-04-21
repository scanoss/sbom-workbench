import fs from 'fs';
import { rescanService, RescanSummary } from '../../../services/RescanService';
import { RescanTask } from './RescanTask';
import { CodeDispatcher } from '../dispatcher/CodeDispatcher';
import { CodeScannerInputAdapter } from '../adapter/CodeScannerInputAdapter';
import { Project } from '../../../workspace/Project';
import { utilModel } from '../../../model/UtilModel';
import { CollectFilesVisitor } from '../../../workspace/tree/visitor/CollectFilesVisitor';

export class CodeReScanTask extends RescanTask<CodeDispatcher, CodeScannerInputAdapter> {
  constructor(project: Project) {
    super(project, new CodeDispatcher(), new CodeScannerInputAdapter(project));
  }

  public async reScan(resultPath: string): Promise<RescanSummary> {
    const collector = new CollectFilesVisitor();
    this.project.getTree().getRootFolder().accept<void>(collector);
    return rescanService.reScan(collector.files, resultPath, this.project.getMyPath());
  }
}
