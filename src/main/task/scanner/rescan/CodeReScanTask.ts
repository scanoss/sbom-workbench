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

  public async reScan(): Promise<void> {
    const resultPath = `${this.project.getMyPath()}/result.json`;
    const result: Record<any, any> = await utilModel.readFile(resultPath);
    for (const [key, value] of Object.entries(result)) {
      if (!key.startsWith('/')) {
        result[`/${key}`] = value;
        delete result[key];
      }
    }
    await fs.promises.writeFile(resultPath, JSON.stringify(result, null, 2));
    await rescanService.reScan(this.project.getTree().getRootFolder().getFiles(), resultPath, this.project.getMyPath());
  }
}
