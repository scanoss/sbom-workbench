import { ScannerPipeline } from "./ScannerPipeline";
import { Project } from "../../../workspace/Project";
import { ITask } from "../../Task";

export class WFPScannerPipeLineTask extends ScannerPipeline implements ITask<Project, boolean>{

  public async run(project : Project): Promise<boolean> {
    return true;
  }

}
