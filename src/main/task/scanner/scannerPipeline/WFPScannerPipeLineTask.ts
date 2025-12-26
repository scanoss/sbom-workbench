import { ScannerPipeline } from './ScannerPipeline';
import { Project } from '../../../workspace/Project';
import { Scanner } from '../types';
import { WFPIndexTreeTask } from '../../IndexTreeTask/WFPIndexTreeTask';
import { BaseScannerTask } from '../BaseScannerTask';
import { WFPScanTask } from '../scan/WFPScanTask';
import { VulnerabilitiesTask } from '../vulnerability/VulnerabilitiesTask';
import ScannerType = Scanner.PipelineStage;
import { WFPRescanTask } from '../rescan/WFPRescanTask';
import { IDispatch } from '../dispatcher/IDispatch';
import { IScannerInputAdapter } from '../adapter/IScannerInputAdapter';
import { WFPResumeTask } from '../resume/WFPResumeTask';
import { CryptographyTask } from '../cryptography/CryptographyTask';
import { IndexTask } from '../../search/indexTask/IndexTask';


export class WFPScannerPipeLineTask extends ScannerPipeline {
  public async run(project: Project): Promise<boolean> {
    const { metadata } = project;

    // index
    if (
      metadata.getScannerConfig().mode === Scanner.ScannerMode.SCAN
      || metadata.getScannerConfig().mode === Scanner.ScannerMode.RESCAN
    ) this.queue.push(new WFPIndexTreeTask(project));

    // scan
    const scanTask :BaseScannerTask<IDispatch, IScannerInputAdapter> = metadata.getScannerConfig().mode === Scanner.ScannerMode.SCAN
      ? new WFPScanTask(project)
      : metadata.getScannerConfig().mode === Scanner.ScannerMode.RESUME
        ? new WFPResumeTask(project)
        : new WFPRescanTask(project);

    this.queue.push(scanTask);

    // vulnerabilities
    if (metadata.getScannerConfig().pipelineStages.includes(ScannerType.VULNERABILITIES)) this.queue.push(new VulnerabilitiesTask(project));

    // Cryptography
    if (metadata.getScannerConfig().pipelineStages.includes(ScannerType.CRYPTOGRAPHY) && project.getApiKey()) this.queue.push(new CryptographyTask(project));

    // search index
    if (metadata.getScannerConfig().pipelineStages.includes((ScannerType.SEARCH_INDEX))) {
      this.queue.push(new IndexTask(project));
    }

    for await (const [index, task] of this.queue.entries()) {
      const success = await this.executeTask(task, index);
      if (!success) {
        // Task was stopped
        return false;
      }
    }
    await this.done(project);

    return true;
  }
}
