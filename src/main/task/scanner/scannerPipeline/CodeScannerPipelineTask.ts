import { ScanTask } from '../ScanTask';
import { DependencyTask } from '../DependencyTask';
import { VulnerabilitiesTask } from '../VulnerabilitiesTask';
import { IndexTask } from '../../search/indexTask/IndexTask';
import { BaseScannerTask } from '../BaseScannerTask';
import { ReScanTask } from '../ReScanTask';
import { Project } from '../../../workspace/Project';
import { Scanner } from '../types';
import { ResumeScanTask } from '../ResumeScanTask';
import { DecompressTask } from '../../decompress/DecompressTask';
import ScannerType = Scanner.ScannerType;
import {ScannerPipeline} from "./ScannerPipeline";
import {CodeIndexTreeTask} from "../../IndexTreeTask/CodeIndexTreeTask";

export class CodeScannerPipelineTask extends ScannerPipeline{
  public async run(project: Project): Promise<boolean> {
    const { metadata } = project;

    // decompress
    if (metadata.getScannerConfig().type.includes(ScannerType.UNZIP))
      this.queue.push(new DecompressTask(project));

    // index
    if (
      metadata.getScannerConfig().mode === Scanner.ScannerMode.SCAN ||
      metadata.getScannerConfig().mode === Scanner.ScannerMode.RESCAN
    )
      this.queue.push(new CodeIndexTreeTask(project));

    // scan
    const scanTask: BaseScannerTask =
      metadata.getScannerConfig().mode === Scanner.ScannerMode.SCAN
        ? new ScanTask(project)
        : metadata.getScannerConfig().mode === Scanner.ScannerMode.RESUME
        ? new ResumeScanTask(project)
        : new ReScanTask(project);

    if (metadata.getScannerConfig().type.includes(ScannerType.CODE)) {
      this.queue.push(scanTask);
    }

    // dependencies
    if (metadata.getScannerConfig().type.includes(ScannerType.DEPENDENCIES))
      this.queue.push(new DependencyTask(project));

    // vulnerabilities
    if (metadata.getScannerConfig().type.includes(ScannerType.VULNERABILITIES))
      this.queue.push(new VulnerabilitiesTask(project));

    // search index
    this.queue.push(new IndexTask(project));

    for await (const [index, task] of this.queue.entries()) {
      await this.executeTask(task, index);
    }

    await this.done(project);

    return true;
  }
}
