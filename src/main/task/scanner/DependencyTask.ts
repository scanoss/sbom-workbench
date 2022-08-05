import { DependencyScanner } from 'scanoss';
import fs from 'fs';
import log from 'electron-log';
import { IpcChannels } from '../../../api/ipc-channels';
import { BlackListDependencies } from '../../workspace/tree/blackList/BlackListDependencies';
import { ITask } from '../Task';
import { broadcastManager } from '../../broadcastManager/BroadcastManager';
import { Project } from '../../workspace/Project';
import { dependencyService } from '../../services/DependencyService';

export class DependencyTask implements ITask<void, boolean> {
  private project: Project;

  constructor(project: Project) {
    this.project = project;
  }

  public async run(params: void): Promise<boolean> {
    broadcastManager.get().send(IpcChannels.SCANNER_UPDATE_STATUS, {
      stage: {
        stageName: `Analyzing dependencies`,
        stageStep: 3,
      },
      processed: 0,
    });

    await this.scanDependencies();
    await this.addDependencies();

    return Promise.resolve(true);
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
        await fs.promises.readFile(`${this.project.metadata.getMyPath()}/dependencies.json`, 'utf8')
      );
      this.project.tree.addDependencies(dependencies);
      await dependencyService.insert(dependencies);
      this.project.save();
    } catch (e) {
      log.error(e);
    }
  }
}
