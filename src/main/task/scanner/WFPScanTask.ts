import {ScanTask} from "./ScanTask";
import {ScannerInput} from "scanoss";

export class WFPScanTask extends ScanTask{


  // Override
  public adapterToScannerInput(
    filesToScan: Record<string, string>
  ): Array<ScannerInput> {
  const scannerInput:Array<ScannerInput> =[{
    fileList: [],
    wfpPath:  this.project.getScanRoot(), 



  }];


  return scannerInput;
  }
}
