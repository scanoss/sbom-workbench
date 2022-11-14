import { ScannerPipeline } from "./ScannerPipeline";
import { Project } from "../../../workspace/Project";
import { Scanner } from "../types";
import { WFPIndexTreeTask } from "../../IndexTreeTask/WFPIndexTreeTask";
import { BaseScannerTask } from "../BaseScannerTask";
import { WFPScanTask } from "../scan/WFPScanTask";
import { VulnerabilitiesTask } from "../vulnerability/VulnerabilitiesTask";
import ScannerType = Scanner.ScannerType;
import { WFPRescanTask } from "../rescan/WFPRescanTask";
import { IDispatch } from "../dispatcher/IDispatch";
import { IScannerInputAdapter } from "../adapter/IScannerInputAdapter";
import {WFPResumeTask} from "../resume/WFPResumeTask";

export class WFPScannerPipeLineTask extends ScannerPipeline {

  public async run(project: Project): Promise<boolean> {
    const { metadata } = project;

    // index
    if (
      metadata.getScannerConfig().mode === Scanner.ScannerMode.SCAN ||
      metadata.getScannerConfig().mode === Scanner.ScannerMode.RESCAN
    )
      this.queue.push(new WFPIndexTreeTask(project));

    // scan
    const scanTask :BaseScannerTask<IDispatch, IScannerInputAdapter> =
      metadata.getScannerConfig().mode === Scanner.ScannerMode.SCAN
        ? new WFPScanTask(project)
        : metadata.getScannerConfig().mode === Scanner.ScannerMode.RESUME
          ? new WFPResumeTask(project)
          : new WFPRescanTask(project);

    this.queue.push(scanTask);

    // vulnerabilities
    if (metadata.getScannerConfig().type.includes(ScannerType.VULNERABILITIES))
      this.queue.push(new VulnerabilitiesTask(project));


    for await (const [index, task] of this.queue.entries()) {
      await this.executeTask(task, index);
    }
    await this.done(project);

    return true;
  }
}
