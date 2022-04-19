import log from 'electron-log';
import {IDependencyResponse} from 'scanoss';
import {NewDependencyDTO} from '../../api/dto';
import {Dependency, FileStatusType} from '../../api/types';
import {dependencyHelper} from '../helpers/DependencyHelper';
import {fileHelper} from '../helpers/FileHelper';
import {licenseHelper} from '../helpers/LicenseHelper';
import {QueryBuilderCreator} from '../model/queryBuilder/QueryBuilderCreator';
import {modelProvider} from './ModelProvider';

class DependencyService {
  public async insert(dependencies: IDependencyResponse): Promise<void> {
    const filesDependencies = dependencyHelper.dependecyModelAdapter(dependencies);
    const files = await fileHelper.getPathFileId();
    const filesIds = [];
    filesDependencies.forEach((fileDependency) => {
      fileDependency.fileId=files[fileDependency.file];
      filesIds.push(files[fileDependency.file]);
    });
    await modelProvider.model.file.updateFileType( filesIds,"MATCH");
    await modelProvider.model.dependency.insert(filesDependencies);
  }

  public async getAll(params: any): Promise<Array<Dependency>> {
    try {
      const queryBuilder = QueryBuilderCreator.create(params);
      const dependencies = await modelProvider.model.dependency.getAll(queryBuilder);
      const inventory: any = await modelProvider.model.inventory.getAll();
      const component: any = await modelProvider.model.component.getAll();
      dependencyHelper.mergeInventoryComponentToDependency(dependencies, inventory, component);
      return dependencies;
    } catch (err: any) {
      log.error(err);
      return err;
    }
  }

  public async accept(params: NewDependencyDTO): Promise<Dependency> {
    try {
      if (!params.dependencyId) throw new Error('Dependency id is required');
      const queryBuilderDependency = QueryBuilderCreator.create({ id: params.dependencyId });
      let dependency: Dependency = (await modelProvider.model.dependency.getAll(queryBuilderDependency))[0];
      const queryBuilderComp = QueryBuilderCreator.create({ purl: params.purl, version: params.version });
      let comp = (await modelProvider.model.component.getAll(queryBuilderComp))[0];
      let lic: any = await modelProvider.model.license.getBySpdxId(dependency.licenses.length > 0 ? dependency.licenses[0] : params.license);
      //Create license if it not exists in the catalog
      if (!lic) {
        const licenseName = licenseHelper.licenseNameToSPDXID(dependency.licenses.length > 0 ? dependency.licenses[0] : params.license);
        lic = await modelProvider.model.license.create({
          spdxid: dependency.licenses.length>0 ? dependency.licenses[0] : params.license,
          name: licenseName,
          fulltext: '',
          url: '',
        });
      }
      //Create component if it not exists in the catalog
      if (!comp)
        comp = await modelProvider.model.component.create({
          name: dependency.componentName || dependency.purl,
          version: params.version,
          purl: params.purl,
          license_id: lic.id,
        });
      else
        await modelProvider.model.license.licenseAttach({ license_id: lic.id, compid: comp.compid });

      // Update dependency
      dependency = { ...dependency, licenses: [params.license], version: params.version };
      const dep = [];
      dep.push(null,dependency.scope? dependency.scope: null,dependency.purl,dependency.version,dependency.licenses.join(','),dependency.dependencyId);
      await modelProvider.model.dependency.update(dep);

      // Create inventory
      await modelProvider.model.inventory.create({ cvid: comp.compid, spdxid: params.license, source: 'declared' });
      const response = (await this.getAll({ id: params.dependencyId }))[0];
      return response;
    } catch (error: any) {
      log.error(error);
      return error;
    }
  }

  public async restore(dependencyId: number): Promise<boolean> {
    try {
      const dep = (await this.getAll({ id: dependencyId }))[0];
      if (dep.status === 'identified') {
        await modelProvider.model.inventory.delete(dep.inventory);
        if (dep.component.source === 'manual') await modelProvider.model.component.deleteByID([dep.component.compid]);
      }
      const params= [];
      params.push(null,dep.scope? dep.scope: null,dep.purl,dep.originalVersion,dep.originalLicense ? dep.originalLicense.join(',') : null ,dep.dependencyId);
      await modelProvider.model.dependency.update(params);
      return true;
    } catch (error: any) {
      log.error(error);
      return error;
    }
  }

  public async getDependenciesFiles(): Promise<Set<string>> {
    try {
      const dependencies = new Set<string>();
      const dep = await modelProvider.model.dependency.getDependenciesFiles();
      dep.forEach((d) => {
        dependencies.add(d.path);
      });
      return dependencies;
    } catch (error: any) {
      log.error(error);
      return error;
    }
  }

  public async acceptAllByIds(acceptedDep: Array<Dependency>): Promise<Array<Dependency>> {
    try {
      const dependencies = acceptedDep;
      const response = [];
      for (const dep of dependencies) {
        const d = await this.accept({
          dependencyId: dep.dependencyId,
          purl: dep.purl,
          version: dep.version,
          license: dep.licenses[0],
        } as NewDependencyDTO);
        response.push(d);
      }
      return response;
    } catch (error: any) {
      log.error(error);
      return error;
    }
  }

  public async reject(dependencyId: number): Promise<Dependency> {
    try {
      const dep = (await this.getAll({ id: dependencyId }))[0];
      const params= [];
    //  `UPDATE dependencies SET rejectedAt=?,scope=?,purl=?,version=?,licenses=? WHERE dependencyId=?
      params.push(new Date().toISOString(),dep.scope? dep.scope :null,dep.purl,dep.version,dep.licenses.length > 0 ? dep.licenses.join(','): null,dep.dependencyId);
      await modelProvider.model.dependency.update(params);
      const response = (await this.getAll({ id: dependencyId }))[0];
      return response;
    } catch (error: any) {
      log.error(error);
      return error;
    }
  }

  public async rejectAllByIds(dependencyIds: Array<number>): Promise<Array<Dependency>> {
    try {
      const response = [];
      for(let i = 0; i < dependencyIds.length; i+=1) {
        const dep = await this.reject(dependencyIds[i]);
        response.push(dep);
      }
    return response;
    } catch (error: any) {
      log.error(error);
      return error;
    }
  }

  public async rejectAllByPath(path :string): Promise<Array<Dependency>> {
    try {
      const dependencies = await this.getAll({ path });
      const dependencyIds = dependencies.filter((d) => d.status === FileStatusType.PENDING).map((d) => d.dependencyId);
      const response = [];
      for(let i = 0; i < dependencyIds.length; i+=1) {
        const dep = await this.reject(dependencyIds[i]);
        response.push(dep);
      }
      return response;
    } catch (error: any) {
      log.error(error);
      return error;
    }
  }

  public async acceptAllByPath(path: string): Promise<Array<Dependency>> {
    try {
      let dependencies = await this.getAll({ path });
      dependencies = dependencies.filter((d) => d.status === FileStatusType.PENDING && d.valid==true);
      const response = [];
      for (const dep of dependencies) {
        const d = await this.accept({
          dependencyId: dep.dependencyId,
          purl: dep.purl,
          version: dep.version,
          license: dep.licenses[0],
        } as NewDependencyDTO);
        response.push(d);
      }
      return response;
    } catch (error: any) {
      log.error(error);
      return error;
    }
  }
}

export const dependencyService = new DependencyService();
