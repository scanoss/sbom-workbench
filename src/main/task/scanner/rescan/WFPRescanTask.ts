import fs from "fs";
import { rescanService, RescanSummary } from "../../../services/RescanService";
import { RescanTask } from "./RescanTask";
import { WFPDispatcher } from "../dispatcher/WFPDispatcher";
import { WFPScannerInputAdapter } from "../adapter/WFPScannerInputAdapter";
import { Project } from "../../../workspace/Project";
import {utilModel} from "../../../model/UtilModel";
import { CollectFilesVisitor } from "../../../workspace/tree/visitor/CollectFilesVisitor";

export class WFPRescanTask extends RescanTask<WFPDispatcher,WFPScannerInputAdapter> {

  constructor(project: Project) {
    super(project, new WFPDispatcher(), new WFPScannerInputAdapter(project));
  }

  public async reScan(resultsPath:string): Promise<RescanSummary> {
    const collector = new CollectFilesVisitor();
    this.project.getTree().getRootFolder().accept<void>(collector);
    return rescanService.reScanWFP(collector.files, resultsPath);
  }

}
