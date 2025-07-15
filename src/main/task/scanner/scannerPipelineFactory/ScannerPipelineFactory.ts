import { Scanner } from "../types";
import { ScannerPipeline } from "../scannerPipeline/ScannerPipeline";
import { CodeScannerPipelineTask } from "../scannerPipeline/CodeScannerPipelineTask";
import { WFPScannerPipeLineTask } from "../scannerPipeline/WFPScannerPipeLineTask";
import { ResultFilePipelineTask } from '../scannerPipeline/ResultFilePipelineTask';

export class ScannerPipelineFactory {

  public static getScannerPipeline(source: Scanner.ScannerSource):ScannerPipeline {
    switch (source) {
      case Scanner.ScannerSource.CODE:
        return new CodeScannerPipelineTask();
        break;
      case Scanner.ScannerSource.WFP:
        return new WFPScannerPipeLineTask();
        break;
      case Scanner.ScannerSource.IMPORTED_RESULTS_RAW:
        return new ResultFilePipelineTask();
        break;
      default:
        return null;
        break;
    }
  }

}
