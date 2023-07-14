import {ScanState} from "../../../../api/types";
import {WFPDispatcher} from "../dispatcher/WFPDispatcher";
import {WFPResumeScannerInputAdapter} from "../adapter/WFPResumeScannerInputAdapter";
import {Project} from "../../../workspace/Project";
import {ScanTask} from "../scan/ScanTask";


export class WFPResumeTask extends ScanTask<WFPDispatcher, WFPResumeScannerInputAdapter> {

  constructor(project: Project) {
    super(project,new WFPDispatcher(),new WFPResumeScannerInputAdapter());
  }

  // @Override
  public async set(): Promise<void> {
    await this.project.open();
    const scanState: ScanState = this.project.metadata.getScannerState();
    if (scanState !== ScanState.SCANNING && scanState !== ScanState.RESCANNING)
      throw new Error('Cannot resume project');
  }

}
