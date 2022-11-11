import { rescanService } from '../../../services/RescanService';
import { RescanTask } from "./RescanTask";
import { CodeDispatcher } from "../dispatcher/CodeDispatcher";
import { CodeScannerInputAdapter } from "../adapter/CodeScannerInputAdapter";
import {Project} from "../../../workspace/Project";

export class CodeReScanTask extends RescanTask<CodeDispatcher,CodeScannerInputAdapter> {

  constructor(project: Project) {
    super(project,new CodeDispatcher(),new CodeScannerInputAdapter());
  }

  public async reScan(): Promise<void> {
    const resultPath = `${this.project.getMyPath()}/result.json`;
    await rescanService.reScan(
      this.project.getTree().getRootFolder().getFiles(),
      resultPath,
      this.project.getMyPath()
    );
  }

}
