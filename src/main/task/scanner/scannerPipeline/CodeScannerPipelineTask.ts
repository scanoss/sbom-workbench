import { CodeScanTask } from '../scan/CodeScanTask';
import { DependencyTask } from '../dependency/DependencyTask';
import { VulnerabilitiesTask } from '../vulnerability/VulnerabilitiesTask';
import { IndexTask } from '../../search/indexTask/IndexTask';
import { BaseScannerTask } from '../BaseScannerTask';
import { CodeReScanTask } from '../rescan/CodeReScanTask';
import { Project } from '../../../workspace/Project';
import { Scanner } from '../types';
import { ResumeScanTask } from '../resume/ResumeScanTask';
import { DecompressTask } from '../../decompress/DecompressTask';
import { ScannerPipeline } from './ScannerPipeline';
import { CodeIndexTreeTask } from '../../IndexTreeTask/CodeIndexTreeTask';
import { IScannerInputAdapter } from '../adapter/IScannerInputAdapter';
import { IDispatch } from '../dispatcher/IDispatch';
import ScannerType = Scanner.ScannerType;
import { CryptographyTask } from '../cryptography/CryptographyTask';
import { userSettingService } from '../../../services/UserSettingService';
import { LocalCryptographyTask } from '../cryptography/LocalCryptographyTask';

export class CodeScannerPipelineTask extends ScannerPipeline {
  public async run(project: Project): Promise<boolean> {
    const { metadata } = project;

    // decompress
    if (metadata.getScannerConfig().type.includes(ScannerType.UNZIP)) this.queue.push(new DecompressTask(project));

    // index
    if (
      metadata.getScannerConfig().mode === Scanner.ScannerMode.SCAN
      || metadata.getScannerConfig().mode === Scanner.ScannerMode.RESCAN
    ) this.queue.push(new CodeIndexTreeTask(project));

    // scan
    const scanTask: BaseScannerTask<IDispatch, IScannerInputAdapter> = metadata.getScannerConfig().mode === Scanner.ScannerMode.SCAN
      ? new CodeScanTask(project)
      : metadata.getScannerConfig().mode === Scanner.ScannerMode.RESUME
        ? new ResumeScanTask(project)
        : new CodeReScanTask(project);

    if (metadata.getScannerConfig().type.includes(ScannerType.CODE)) {
      this.queue.push(scanTask);
    }

    // dependencies
    if (metadata.getScannerConfig().type.includes(ScannerType.DEPENDENCIES)) this.queue.push(new DependencyTask(project));

    // vulnerabilities
    if (metadata.getScannerConfig().type.includes(ScannerType.VULNERABILITIES)) this.queue.push(new VulnerabilitiesTask(project));

    // Cryptography
    if (metadata.getScannerConfig().type.includes((ScannerType.CRYPTOGRAPHY)) && project.getGlobalApiKey()) {
      this.queue.push(new CryptographyTask(project));
    }

    this.queue.push(new LocalCryptographyTask(project));

    // search index
    this.queue.push(new IndexTask(project));

    for await (const [index, task] of this.queue.entries()) {
      await this.executeTask(task, index);
    }

    await this.done(project);

    return true;
  }
}
