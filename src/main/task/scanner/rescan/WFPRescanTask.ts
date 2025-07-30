import fs from "fs";
import { rescanService } from "../../../services/RescanService";
import { RescanTask } from "./RescanTask";
import { WFPDispatcher } from "../dispatcher/WFPDispatcher";
import { WFPScannerInputAdapter } from "../adapter/WFPScannerInputAdapter";
import { Project } from "../../../workspace/Project";
import {utilModel} from "../../../model/UtilModel";

export class WFPRescanTask extends RescanTask<WFPDispatcher,WFPScannerInputAdapter> {

  constructor(project: Project) {
    super(project, new WFPDispatcher(), new WFPScannerInputAdapter(project));
  }

  public async reScan(resultsPath:string): Promise<void> {
    await rescanService.reScanWFP(
      this.project.getTree().getRootFolder().getFiles(),
      resultsPath
    );
  }

}
