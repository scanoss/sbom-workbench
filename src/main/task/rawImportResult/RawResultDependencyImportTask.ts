import { modelProvider } from '../../services/ModelProvider';
import { dependencyService } from '../../services/DependencyService';
import { Scanner } from '../scanner/types';
import { Project } from '../../workspace/Project';
import { IDependency, IDependencyFile, IDependencyResponse, IDependencyLicense } from 'scanoss';
import i18next from 'i18next';
import path from 'path';
import fs from 'fs';
import { ScannerStage } from '../../../api/types';
import log from 'electron-log';
import { parser } from 'stream-json';
import { streamObject } from 'stream-json/streamers/StreamObject';

interface DependencyLicense{
  "is_spdx_approved": boolean;
  "name": string;
  "spdx_id": string;
}

interface ResultDependency{
  "component": string;
  "licenses": Array<DependencyLicense>;
  "purl": string;
  "url": string;
  "version": string;
}

export class RawResultDependencyImportTask implements Scanner.IPipelineTask {

  private project: Project;

  constructor(project: Project) {
    this.project = project;
  }

  private getDependencyLicenses(licenses: DependencyLicense[]): Array<IDependencyLicense> {
    const dependencyList : Array<IDependencyLicense> = [];
    licenses.forEach((l) => {
      dependencyList.push({
        name: l.name,
        spdxId: l.spdx_id,
        isSpdxApproved: l.is_spdx_approved,
        url: ''
      });
    });
    return dependencyList;
  }

  private processFileDependencies(fileName: string,dependencies: Array<ResultDependency>): IDependencyFile {
    const fileDependency: IDependencyFile = {
      file: fileName,
      id: 'dependency',
      status: 'pending',
      dependenciesList: [],
    }
    dependencies.forEach((d: ResultDependency) => {
      const dependencyList: IDependency = {
        component: d.component || '',
        scope: 'unknown', // Add scope from data if available
        version: d.version || null,
        purl: d.purl || '',
        licensesList: [],
        requirement: d.version,
        url: d.url,
        comment: ''
      };
      const licenses = this.getDependencyLicenses(d.licenses);
      dependencyList.licensesList.push(...licenses)
      fileDependency.dependenciesList.push(dependencyList);
    });
    return fileDependency;
  }

  private async getDependencies(): Promise<IDependencyResponse> {
    const resultPath = path.join(this.project.getMyPath(), 'result.json');
    const dependencies: IDependencyResponse = {filesList: [], status:null};
    const pipeline = fs.createReadStream(resultPath)
      .pipe(parser())
      .pipe(streamObject());

    return new Promise((resolve, reject) => {
      pipeline.on('data', async ({ file, results }) => {
        results.forEach((r: any) => {
          if(r.id === "dependency"){
            const fileList = this.processFileDependencies(file, r.dependencies);
            dependencies.filesList.push(fileList)
          }
        });
      });
      pipeline.on('end', () => {
        resolve(dependencies);
      });
      pipeline.on('error', (err) => {
        reject(err);
      });
    })
  }

  public getStageProperties(): Scanner.StageProperties{
    return {
      name: ScannerStage.DEPENDENCY,
      label: i18next.t('Title:AnalyzingDependencies'),
      isCritical: false,
    };
  }

  public async run(): Promise<boolean> {

    const dependencies: IDependencyResponse = await this.getDependencies();
    log.info(`[ResultDependencyTask]: Adding ${dependencies.filesList.length} dependencies`);
    this.project.tree.addDependencies(dependencies);
    // Clean table
    await modelProvider.model.dependency.deleteAll();
    // Insert new dependencies
    await dependencyService.insert(dependencies);
    this.project.save();
    return true;
  }
}
