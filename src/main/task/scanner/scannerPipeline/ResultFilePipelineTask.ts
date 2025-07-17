import { ScannerPipeline } from './ScannerPipeline';
import { Project } from '../../../workspace/Project';
import log from 'electron-log';
import { ResultFileTreeTask } from '../../importFileResult/ResultFileTreeTask';
import { ComponentImportTask } from '../../ComponentImportation/ComponentImportTask';
import { ResultDependencyTask } from '../../importFileResult/ResultDependencyTask';
import { SetupFileResultImportTask } from '../../importFileResult/SetupFileResultImportTask';
import { VulnerabilitiesTask } from '../vulnerability/VulnerabilitiesTask';
import { CryptographyTask } from '../cryptography/CryptographyTask';
import { LocalCryptographyTask } from '../cryptography/LocalCryptographyTask';
import { Scanner } from '../types';
import ScannerType = Scanner.ScannerType;

export class ResultFilePipelineTask extends ScannerPipeline {

  public async run(project: Project): Promise<boolean> {
    log.info("[Result File Pipeline Task init]...")
    const { metadata } = project;
    // Setup
    this.queue.push(new SetupFileResultImportTask(project));

    // Index
    this.queue.push(new ResultFileTreeTask(project));

    // Import component task
    this.queue.push(new ComponentImportTask(project));

    // Dependency
    this.queue.push(new ResultDependencyTask(project));

    // Vulnerabilities
    if (metadata.getScannerConfig().type.includes(ScannerType.VULNERABILITIES)) this.queue.push(new VulnerabilitiesTask(project));

    // Cryptography
    if (metadata.getScannerConfig().type.includes((ScannerType.CRYPTOGRAPHY)) && project.getApiKey()) {
      this.queue.push(new CryptographyTask(project));
    }

    for await (const [index, task] of this.queue.entries()) {
      await this.executeTask(task, index);
    }

    await this.done(project);
    return true;
  }
}
