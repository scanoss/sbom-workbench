import { ScannerInput } from "scanoss";
import {IScannerInputAdapter} from "./IScannerInputAdapter";
import { Project } from "../../../workspace/Project";

export class WFPResumeScannerInputAdapter implements IScannerInputAdapter {
  adapterToScannerInput(project: Project, filesToScan: Record<string, string>): Array<ScannerInput> {
    // @Override
    const scannerInput:Array<ScannerInput> =[{
      fileList: Object.keys(project.filesToScan),
      wfpPath:  project.getScanRoot(),
    }];
    return scannerInput;
  }
}
