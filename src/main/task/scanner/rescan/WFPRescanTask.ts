import { rescanService } from "../../../services/RescanService";
import { RescanTask } from "./RescanTask";
import { WFPDispatcher } from "../dispatcher/WFPDispatcher";
import { WFPScannerInputAdapter } from "../adapter/WFPScannerInputAdapter";
import {Project} from "../../../workspace/Project";

export class WFPRescanTask extends RescanTask<WFPDispatcher,WFPScannerInputAdapter> {

  constructor(project: Project) {
    super(project,new WFPDispatcher(),new WFPScannerInputAdapter());
  }

  public async reScan(): Promise<void> {
    const resultPath = `${this.project.getMyPath()}/result.json`;
    await rescanService.reScanWFP(
      this.project.getTree().getRootFolder().getFiles(),
      resultPath
    );
  }

}
