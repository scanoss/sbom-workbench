import {ScanState} from "../../../../api/types";
import {WFPDispatcher} from "../dispatcher/WFPDispatcher";
import {WFPResumeScannerInputAdapter} from "../adapter/WFPResumeScannerInputAdapter";
import {Project} from "../../../workspace/Project";
import {ScanTask} from "../scan/ScanTask";


export class WFPResumeTask extends ScanTask<WFPDispatcher, WFPResumeScannerInputAdapter> {

  constructor(project: Project) {
    super(project,new WFPDispatcher(),new WFPResumeScannerInputAdapter(project));
  }

  // @Override
  public async set(): Promise<void> {
    await this.project.open();
    this.project.processedFiles = this.project.filesSummary.include - Object.keys(this.project.filesToScan).length;
    const scanState: ScanState = this.project.metadata.getScannerState();
    if (scanState !== ScanState.SCANNING && scanState !== ScanState.RESCANNING)
      throw new Error('Cannot resume project');
  }

}
