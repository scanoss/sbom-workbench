import { ScanTask } from "./ScanTask";
import { WFPDispatcher } from "../dispatcher/WFPDispatcher";
import { WFPScannerInputAdapter } from "../adapter/WFPScannerInputAdapter";
import {Project} from "../../../workspace/Project";

export class WFPScanTask extends ScanTask <WFPDispatcher, WFPScannerInputAdapter>  {

  constructor(project: Project) {
    super(project,new WFPDispatcher(),new WFPScannerInputAdapter());
  }

}
