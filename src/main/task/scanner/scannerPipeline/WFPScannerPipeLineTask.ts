import { ScannerPipeline } from "./ScannerPipeline";
import { Project } from "../../../workspace/Project";
import { Scanner } from "../types";
import { WFPIndexTreeTask } from "../../IndexTreeTask/WFPIndexTreeTask";
import { BaseScannerTask } from "../BaseScannerTask";
import { WFPScanTask } from "../WFPScanTask";

export class WFPScannerPipeLineTask extends ScannerPipeline {

  public async run(project : Project): Promise<boolean> {
    const { metadata } = project;

    // index
    if (
      metadata.getScannerConfig().mode === Scanner.ScannerMode.SCAN ||
      metadata.getScannerConfig().mode === Scanner.ScannerMode.RESCAN
    )
      this.queue.push(new WFPIndexTreeTask(project));

    // scan
    const scanTask: BaseScannerTask = new WFPScanTask(project);
    this.queue.push(scanTask);

    for await (const [index, task] of this.queue.entries()) {
      await this.executeTask(task, index);
    }
    await this.done(project);

    return true;
  }
}
