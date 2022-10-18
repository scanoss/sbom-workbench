import { DependencyScanner } from 'scanoss';
import fs from 'fs';
import log from 'electron-log';
import { BlackListDependencies } from '../../workspace/tree/blackList/BlackListDependencies';
import { Project } from '../../workspace/Project';
import { dependencyService } from '../../services/DependencyService';
import { Scanner } from './types';
import { ScannerStage } from '../../../api/types';

export class DependencyTask implements Scanner.IPipelineTask {
  private project: Project;

  constructor(project: Project) {
    this.project = project;
  }

  public getStageProperties(): Scanner.StageProperties {
    return {
      name: ScannerStage.DEPENDENCY,
      label: 'Analyzing Dependencies',
      isCritical: false,
    };
  }

  public async run(): Promise<boolean> {
    log.info('[ DependencyTask init ]');

    await this.scanDependencies();
    await this.addDependencies();
    await this.project.save();
    return true;
  }

  private async scanDependencies() {
    try {
      const allFiles = [];
      const rootPath = this.project.metadata.getScanRoot();
      this.project.tree
        .getRootFolder()
        .getFiles(new BlackListDependencies())
        .forEach((f: File) => {
          allFiles.push(rootPath + f.path);
        });
      const dependencies = await new DependencyScanner().scan(allFiles);
      dependencies.filesList.forEach((f) => {
        f.file = f.file.replace(rootPath, '');
      });
      await fs.promises.writeFile(
        `${this.project.metadata.getMyPath()}/dependencies.json`,
        JSON.stringify(dependencies, null, 2)
      );
    } catch (e) {
      log.error(e);
    }
  }

  private async addDependencies() {
    try {
      const dependencies = JSON.parse(
        await fs.promises.readFile(
          `${this.project.metadata.getMyPath()}/dependencies.json`,
          'utf8'
        )
      );
      this.project.tree.addDependencies(dependencies);
      await dependencyService.insert(dependencies);
    } catch (e) {
      log.error(e);
    }
  }
}
