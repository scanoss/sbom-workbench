import fs from "fs";
import { rescanService } from "../../../services/RescanService";
import { RescanTask } from "./RescanTask";
import { WFPDispatcher } from "../dispatcher/WFPDispatcher";
import { WFPScannerInputAdapter } from "../adapter/WFPScannerInputAdapter";
import { Project } from "../../../workspace/Project";
import {utilModel} from "../../../model/UtilModel";

export class WFPRescanTask extends RescanTask<WFPDispatcher,WFPScannerInputAdapter> {

  constructor(project: Project) {
    super(project, new WFPDispatcher(), new WFPScannerInputAdapter());
  }

  public async reScan(): Promise<void> {
    const resultPath = `${this.project.getMyPath()}/result.json`;
    const result: Record<any, any> = await utilModel.readFile(resultPath);
    for (const [key, value] of Object.entries(result)) {
      if(!key.startsWith("/")) {
        result[`/${key}`] = value;
        delete result[key];
      }
    }
    await fs.promises.writeFile(resultPath,JSON.stringify(result,null,2));
    await rescanService.reScanWFP(
      this.project.getTree().getRootFolder().getFiles(),
      resultPath
    );
  }

}
