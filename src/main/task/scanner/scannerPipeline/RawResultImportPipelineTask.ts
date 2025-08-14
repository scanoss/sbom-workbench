import { ScannerPipeline } from './ScannerPipeline';
import { Project } from '../../../workspace/Project';
import log from 'electron-log';

import { VulnerabilitiesTask } from '../vulnerability/VulnerabilitiesTask';
import { CryptographyTask } from '../cryptography/CryptographyTask';
import { Scanner } from '../types';
import ScannerType = Scanner.ScannerType;
import { ImportTask } from '../../import/ImportTask';
import { RawResultSetupTask } from '../../rawImportResult/RawResultSetupTask';
import { RawResultFileTreeTask } from '../../rawImportResult/RawResultFileTreeTask';
import { RawResultDependencyImportTask } from '../../rawImportResult/RawResultDependencyImportTask';

export class RawResultImportPipelineTask extends ScannerPipeline {

  public async run(project: Project): Promise<boolean> {
    log.info("[Result File Pipeline Task init]...")
    const { metadata } = project;
    // Setup
    this.queue.push(new RawResultSetupTask(project));

    // Index
    this.queue.push(new RawResultFileTreeTask(project));

    // Import task
    this.queue.push(new ImportTask(project));

    // Dependency
    this.queue.push(new RawResultDependencyImportTask(project));

    // Vulnerabilities
    if (metadata.getScannerConfig().type.includes(ScannerType.VULNERABILITIES)) {
      this.queue.push(new VulnerabilitiesTask(project));
    }

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
