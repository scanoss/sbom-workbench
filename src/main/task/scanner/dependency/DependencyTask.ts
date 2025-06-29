import { DependencyScanner, DependencyScannerCfg } from 'scanoss';
import fs from 'fs';
import log from 'electron-log';
import i18next from 'i18next';
import { BlackListDependencies } from '../../../workspace/tree/blackList/BlackListDependencies';
import { Project } from '../../../workspace/Project';
import { dependencyService } from '../../../services/DependencyService';
import { Scanner } from '../types';
import { ScannerStage } from '../../../../api/types';
import { userSettingService } from '../../../services/UserSettingService';
import { modelProvider } from '../../../services/ModelProvider';
import AppConfigModule from '../../../../config/AppConfigModule';

export class DependencyTask implements Scanner.IPipelineTask {
  protected project: Project;

  constructor(project: Project) {
    this.project = project;
  }

  public getStageProperties(): Scanner.StageProperties {
    return {
      name: ScannerStage.DEPENDENCY,
      label: i18next.t('Title:AnalyzingDependencies'),
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
        .getFiles(new BlackListDependencies(`${this.project.metadata.getMyPath()}/filter.json`))
        .forEach((f: File) => {
          allFiles.push(rootPath + f.path);
        });

      const cfg = new DependencyScannerCfg();
      const { GRPC_PROXY } = userSettingService.get();
      cfg.GRPC_PROXY = GRPC_PROXY || '';

      const chunks = [];
      for (let i = 0; i < allFiles.length; i += AppConfigModule.DEFAULT_SERVICE_CHUNK_LIMIT) {
        chunks.push(allFiles.slice(i, i + 10));
      }
      const depScanner = new DependencyScanner(cfg);
      const promises = chunks.map(async (chunk) => {
        try {
          return await depScanner.scan(chunk);
        } catch (err: any) {
          log.error('[ DependencyTask ] Request failed for files:', chunk.map((file: any) => file));
          log.error('Error:', err);
          return null;
        }
      });
      const results = await Promise.all(promises);

      const dependencies = results.reduce((acc, curr) => {
        if (!curr) return acc;
        return {
          filesList: [...(acc.filesList || []), ...(curr.filesList || [])],
        };
      }, { filesList: [] });
      dependencies.filesList.forEach((f) => {
        f.file = f.file.replace(rootPath, '');
      });
      await fs.promises.writeFile(`${this.project.metadata.getMyPath()}/dependencies.json`, JSON.stringify(dependencies, null, 2));
    } catch (e) {
      log.error(e);
      throw e;
    }
  }

  private async addDependencies(): Promise<void> {
    try {
      const dependencies = JSON.parse(await fs.promises.readFile(`${this.project.metadata.getMyPath()}/dependencies.json`, 'utf8'));
      this.project.tree.addDependencies(dependencies);
      // Clean table
      await modelProvider.model.dependency.deleteAll();
      // Insert new dependencies
      await dependencyService.insert(dependencies);
    } catch (e) {
      log.error(e);
      throw e;
    }
  }
}
