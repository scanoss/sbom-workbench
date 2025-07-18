import { modelProvider } from '../../services/ModelProvider';
import { dependencyService } from '../../services/DependencyService';
import { Scanner } from '../scanner/types';
import { Project } from '../../workspace/Project';
import { IDependencyResponse, LicensesList , FilesList } from 'scanoss';
import i18next from 'i18next';
import path from 'path';
import fs from 'fs';
import { DependenciesList } from 'scanoss/build/main/sdk/Dependencies/DependencyTypes';
import { ScannerStage } from '../../../api/types';
import log from 'electron-log';

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

export class ResultDependencyTask implements Scanner.IPipelineTask {

  private project: Project;

  constructor(project: Project) {
    this.project = project;
  }

  private getDependencyLicenses(licenses: DependencyLicense[]): LicensesList[] {
    const dependencyList: LicensesList[] = [];
    licenses.forEach((l) => {
      dependencyList.push({
        name: l.name,
        spdxId: l.spdx_id,
        isSpdxApproved: l.is_spdx_approved,
      });
    });
    return dependencyList;
  }

  private processFileDependencies(fileName: string,dependencies: Array<ResultDependency>): FilesList {
    const fileDependency = {
      file: fileName,
      id: 'dependency',
      status: 'pending',
      dependenciesList: [],
    }
    dependencies.forEach((d: ResultDependency) => {
      const dependencyList: DependenciesList = {
        component: d.component || '',
        scope: 'unknown', // Add scope from data if available
        version: d.version || null,
        purl: d.purl || '',
        licensesList: [],
      };
      const licenses = this.getDependencyLicenses(d.licenses);
      dependencyList.licensesList.push(...licenses)
      fileDependency.dependenciesList.push(dependencyList);
    });
    return fileDependency;
  }

  private async getDependencies(): Promise<IDependencyResponse> {
    const resultPath = path.join(this.project.getMyPath(), 'result.json');
    const results = await fs.promises.readFile(resultPath, 'utf-8');
    const dependencies: IDependencyResponse = { filesList: [] };
    for (const [file, data] of Object.entries(JSON.parse(results))) {
      const fileData = data as any;
      fileData.forEach((fd: any) => {
          if(fd.id === "dependency"){
            const fileList = this.processFileDependencies(file,fd.dependencies);
            dependencies.filesList.push(fileList)
          }
      });
    }
    return dependencies;
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
