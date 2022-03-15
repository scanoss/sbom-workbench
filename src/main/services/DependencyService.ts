import log from 'electron-log';
import { IDependencyResponse } from 'scanoss';
import { DependencyDTO } from '../../api/types';
import { dependencyHelper } from '../helpers/DependencyHelper';
import { fileHelper } from '../helpers/FileHelper';
import { licenseHelper } from '../helpers/LicenseHelper';
import { QueryBuilderCreator } from '../model/queryBuilder/QueryBuilderCreator';
import { serviceProvider } from './ServiceProvider';

class DependencyService {
  public async insert(dependencies: IDependencyResponse): Promise<void> {
    const filesDependencies = dependencyHelper.dependecyModelAdapter(dependencies);
    const files = await fileHelper.getPathFileId();
    await serviceProvider.model.dependency.insert(files, filesDependencies);
  }

  public async getAll(params: any): Promise<Array<DependencyDTO>> {
    try {
      const queryBuilder = QueryBuilderCreator.create(params);
      const dependencies = await serviceProvider.model.dependency.getAll(queryBuilder);
      const inventory: any = await serviceProvider.model.inventory.getAll();
      const component: any = await serviceProvider.model.component.getAll();
      dependencyHelper.mergeInventoryComponentToDependency(dependencies, inventory, component);
      return dependencies;
    } catch (err: any) {
      log.error(err);
      return err;
    }
  }

  public async accept(params: any): Promise<DependencyDTO> {
    try {
      if (!params.id) throw new Error('Dependency id is required');
      const queryBuilderDependency = QueryBuilderCreator.create({ id: params.id });
      let dependency: any = (await serviceProvider.model.dependency.getAll(queryBuilderDependency))[0];

      const queryBuilerComp = QueryBuilderCreator.create({ purl: params.purl, version: params.version });
      let comp = (await serviceProvider.model.component.getAll(queryBuilerComp))[0];
      // Adds license to dependency if the user define one
      if (dependency.licenses.length === 0) {
        dependency = { ...dependency, licenses: params.license };
        await serviceProvider.model.dependency.insertLicense(dependency);
      }

      let lic: any = await serviceProvider.model.license.getBySpdxId(params.license);
      const licenseName = licenseHelper.licenseNameToSPDXID(params.license);
      if (!lic)
        lic = await serviceProvider.model.license.create({
          spdxid: params.license,
          name: licenseName,
          fulltext: '',
          url: '',
        });

      if (!comp)
        comp = await serviceProvider.model.component.create({
          name: dependency.componentName,
          version: params.version,
          purl: params.purl,
          license_id: lic.id,
        });
      else {
        await serviceProvider.model.license.licenseAttach({ license_id: lic.id, compid: comp.compid });
      }
      await serviceProvider.model.dependency.accept(dependency);
      await serviceProvider.model.inventory.create({ cvid: comp.compid, spdxid: params.license, source: 'declared' });
      const response = (await this.getAll({ id: params.id }))[0];
      return response;
    } catch (error: any) {
      log.error(error);
      return error;
    }
  }
}

export const dependencyService = new DependencyService();
