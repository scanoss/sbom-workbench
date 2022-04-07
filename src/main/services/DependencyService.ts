import log from 'electron-log';
import { IDependencyResponse } from 'scanoss';
import { NewDependencyDTO } from '../../api/dto';
import { Dependency } from '../../api/types';
import { dependencyHelper } from '../helpers/DependencyHelper';
import { fileHelper } from '../helpers/FileHelper';
import { licenseHelper } from '../helpers/LicenseHelper';
import { QueryBuilderCreator } from '../model/queryBuilder/QueryBuilderCreator';
import { modelProvider } from './ModelProvider';

class DependencyService {
  public async insert(dependencies: IDependencyResponse): Promise<void> {
    const filesDependencies = dependencyHelper.dependecyModelAdapter(dependencies);
    const files = await fileHelper.getPathFileId();
    await modelProvider.model.dependency.insert(files, filesDependencies);
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

      dependency = { ...dependency, licenses: [params.license], version: params.version };
      await modelProvider.model.dependency.updateLicenseAndVersion(dependency);

      let lic: any = await modelProvider.model.license.getBySpdxId(params.license);
      const licenseName = licenseHelper.licenseNameToSPDXID(params.license);
      if (!lic)
        lic = await modelProvider.model.license.create({
          spdxid: params.license,
          name: licenseName,
          fulltext: '',
          url: '',
        });

      if (!comp)
        comp = await modelProvider.model.component.create({
          name: dependency.componentName || dependency.purl,
          version: params.version,
          purl: params.purl,
          license_id: lic.id,
        });
      else {
        await modelProvider.model.license.licenseAttach({ license_id: lic.id, compid: comp.compid });
      }
      const dep = [];
      dep.push(null,dependency.scope,dependency.purl,dependency.version,dependency.dependencyId);
      await modelProvider.model.dependency.update(dep);
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
      await modelProvider.model.dependency.restore({dependencyId: dependencyId,version:dep.originalVersion,licenses:dep.originalLicense});
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

  public async acceptAll(acceptedDep: Array<Dependency>): Promise<Array<Dependency>> {
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
      params.push(new Date().toISOString(),dep.scope,dep.purl,dep.version,dep.dependencyId);
      await modelProvider.model.dependency.update(params);
      const response = (await this.getAll({ id: dependencyId }))[0];
      return response;
    } catch (error: any) {
      log.error(error);
      return error;
    }
  }
}

export const dependencyService = new DependencyService();