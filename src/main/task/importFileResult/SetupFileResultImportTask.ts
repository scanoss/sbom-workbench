import { Scanner } from '../scanner/types';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import { Project } from 'main/workspace/Project';
import { ScannerStage } from '../../../api/types';
import i18next from 'i18next';
import { modelProvider } from '../../services/ModelProvider';
import { licenseService } from '../../services/LicenseService';

export class SetupFileResultImportTask implements Scanner.IPipelineTask {
  private project: Project;
  constructor(project: Project) {
    this.project = project;
  }

  private async saveResults(){
    log.info('[ ResultFileTreeTask saveResults ]');
    const resultPath = path.join(this.project.getMyPath(),'result.json');
    const results = await fs.promises.readFile(this.project.getScanRoot(),'utf-8');
    const parsedResults =  JSON.parse(results)
    for (const [key, value] of Object.entries(parsedResults)) {
      if (!key.startsWith('/')) {
        parsedResults[`/${key}`] = value;
        delete parsedResults[key];
      }
    }
    await fs.promises.writeFile(resultPath, JSON.stringify(parsedResults,null,2));
  }

  public getStageProperties(): Scanner.StageProperties {
    return {
      name: ScannerStage.INDEX,
      label: i18next.t('Title:Indexing'),
      isCritical: true,
    };
  }

  public async run(): Promise<boolean> {
    await modelProvider.init(this.project.getMyPath());
    await licenseService.import();
    await this.saveResults();
    return true;
  }
}
