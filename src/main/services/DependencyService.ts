import log from 'electron-log';
import { IDependencyResponse } from 'scanoss';
import { ModelDependencyManifest } from 'main/model/entity/Dependency';
import { LicenseDTO, NewDependencyDTO } from '../../api/dto';
import { Component, Dependency, DependencyManifestFile, FileStatusType, FileUsageType, License } from '../../api/types';
import { dependencyHelper } from '../helpers/DependencyHelper';
import { fileHelper } from '../helpers/FileHelper';
import { licenseHelper } from '../helpers/LicenseHelper';
import { QueryBuilderCreator } from '../model/queryBuilder/QueryBuilderCreator';
import { modelProvider } from './ModelProvider';
import { ComponentSource } from '../model/entity/ComponentVersion';
import { workspace } from '../workspace/Workspace';
import { QueryBuilder } from '../model/queryBuilder/QueryBuilder';

class DependencyService {
  public async insert(dependencies: IDependencyResponse): Promise<void> {
    const files: Record<string, number> = await fileHelper.getPathFileId();
    const filesIds = [];

    // Get dependencies fileIds
    dependencies.filesList.forEach((fileDependency) => {
      if (files[fileDependency.file]) {
        filesIds.push(files[fileDependency.file]);
      }
    });

    // Get array of Dependencies to be inserted in the database
    const dep = dependencyHelper.dependencyModelAdapter(dependencies.filesList, files);

    // Updates file type on database
    await modelProvider.model.file.updateFileType(filesIds, 'MATCH');

    // Insert dependencies in database
    await modelProvider.model.dependency.insertAll(dep);
  }

  public async getAll(params: any): Promise<Array<Dependency>> {
    try {
      const queryBuilder = QueryBuilderCreator.create(params);
      const dependencies = await modelProvider.model.dependency.getAll(queryBuilder);
      const queryBuilderDepInv = QueryBuilderCreator.create({ inventoryUsage: 'dependency' });
      const inventory: any = await modelProvider.model.inventory.getAll(queryBuilderDepInv);
      const component: any = await modelProvider.model.component.getAll();
      dependencyHelper.mergeInventoryComponentToDependency(dependencies, inventory, component);
      return dependencies;
    } catch (err: any) {
      log.error(err);
      throw err;
    }
  }

  public async accept(params: NewDependencyDTO): Promise<Dependency> {
    try {
      console.log('Called dependencyService.accept()');
      const dependency = (await this.getAll({ id: params.dependencyId }))[0];
      dependency.licenses = [params.license];
      dependency.version = params.version;
      await this.acceptAllByIds([dependency]);
      const updatedDependency = [];
      updatedDependency.push(null, dependency.scope ? dependency.scope : null, dependency.purl, dependency.version, dependency.licenses.join(','), dependency.dependencyId);
      await modelProvider.model.dependency.update(updatedDependency);
      return (await this.getAll({ id: params.dependencyId }))[0];
    } catch (error: any) {
      log.error(error);
      throw error;
    }
  }

  public async restore(dependencyId: number): Promise<Dependency> {
    try {
      const dep = (await this.getAll({ id: dependencyId }))[0];
      if (dep.status === 'identified') {
        await modelProvider.model.inventory.delete(dep.inventory);
        if (dep.component.source === 'manual') {
          await modelProvider.model.component.deleteByID([dep.component.compid]);
        }
      }
      const params = [];
      params.push(null, dep.scope ? dep.scope : null, dep.purl, dep.originalVersion, dep.originalLicense ? dep.originalLicense.join(',') : null, dep.dependencyId);
      await modelProvider.model.dependency.update(params);
      const response = (await this.getAll({ id: dependencyId }))[0];
      return response;
    } catch (error: any) {
      log.error(error);
      throw error;
    }
  }

  public async restoreAllByIds(dependenciesIds: number[]): Promise<Array<Dependency>> {
    try {
      const dependencyIdMapper = new Set<Number>(dependenciesIds);
      const dependencies = await this.getAll(null);

      // Filter dependencies to be restored
      const restoreDependencies = dependencies.filter((d) => dependencyIdMapper.has(d.dependencyId));

      // Delete inventories
      const inventoryIds = [];
      restoreDependencies.forEach((d) => { if (d.status === 'identified') inventoryIds.push(d.inventory.id); });
      if (inventoryIds.length > 0) {
        await modelProvider.model.inventory.deleteBulk(inventoryIds);
      }

      // Delete components
      const componentIds = [];
      restoreDependencies.forEach((d) => { if (d.component.source === 'manual') componentIds.push(d.component.compid); });
      if (componentIds.length > 0) {
        await modelProvider.model.component.deleteByID(componentIds);
      }

      // Restore dependencies
      const restore = restoreDependencies.map((d) => {
        return { ...d,
          ...{ rejectedAt: null,
            version: d.originalVersion,
          },
        };
      });
      await modelProvider.model.dependency.updateBulk(restore);

      restoreDependencies.forEach((d) => {
        d.component = null;
        d.status = null;
        d.inventory = null;
        d.status = FileStatusType.PENDING;
        d.version = d.originalVersion;
        d.licenses = d.originalLicense;
      });

      return restoreDependencies;
    } catch (error: any) {
      log.error(error);
      throw error;
    }
  }

  public async restoreAllByPath(path: string): Promise<Array<Dependency>> {
    try {
      // Get depencies to be restore by path
      const dependencies = await this.getAll({ path });
      const ids = dependencies.filter((d) => d.status === FileStatusType.IDENTIFIED || d.status === FileStatusType.ORIGINAL).map((d) => d.dependencyId);

      // Restore dependencies
      return await this.restoreAllByIds(ids);
    } catch (error: any) {
      log.error(error);
      throw error;
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

      // Licenses
      const licenses = await modelProvider.model.license.getAll();
      let licenseMapper = new Map<string, LicenseDTO>();
      const newLicensesMapper = new Map<string, License>();
      licenses.forEach((l) => licenseMapper.set(l.spdxid, l));

      // Get new licenses from dependencies
      dependencies.forEach((d) => {
        d.licenses.forEach((l) => {
          if (!licenseMapper.has(l)) {
            newLicensesMapper.set(l, {
              spdxid: l,
              name: licenseHelper.licenseNameToSPDXID(l),
              fulltext: '',
              url: '',
              official: 0,
            });
          }
        });
      });

      let newLicenseCatalog = [];
      if (newLicensesMapper.size > 0) {
        const newLicenses = await modelProvider.model.license.insertInBulk(Array.from(newLicensesMapper.values()));
        newLicenseCatalog = [...licenses, ...newLicenses];

        // Creates a new map with a new catalog
        licenseMapper = new Map<string, LicenseDTO>();
        newLicenseCatalog.forEach((l) => licenseMapper.set(l.spdxid, l));
      }

      // Create new components
      const components = await modelProvider.model.component.getAll(null);
      const componentMapper = new Map<string, any>();

      components.forEach((c) => {
        componentMapper.set(`${c.purl}@${c.version}`, c);
      });

      let attach = [];
      dependencies.forEach((d) => {
        if (componentMapper.has(`${d.purl}@${d.version}`)) {
          const comp = componentMapper.get(`${d.purl}@${d.version}`);
          const newLicensesToAttach = comp.licenses.filter((license) => !licenseMapper.has(license.spdxid)).map((filteredLicense) => filteredLicense.id);
          attach.push({ compid: comp.compid, license: newLicensesToAttach });
        }
      });

      const newComponentsMapper = new Map<string, Component>();

      dependencies.forEach((d) => {
        if (!componentMapper.has(`${d.purl}@${d.version}`)) {
          const licenseIds = [];
          d.licenses.forEach((l) => licenseIds.push(licenseMapper.get(l).id));

          newComponentsMapper.set(`${d.purl}@${d.version}`, {
            name: d.componentName ? d.componentName : d.purl,
            purl: d.purl,
            version: d.version,
            description: 'n/a',
            url: '',
            source: ComponentSource.MANUAL,
            vendor: '',
            licenses: licenseIds, // Set new licenses ids to be attached
          });
        }
      });

      if (newComponentsMapper.size > 0) {
        const newComponents = await modelProvider.model.component.bulkImport(Array.from(newComponentsMapper.values()));

        // Adapt structure to attach new components to licenses
        const newComponentLicenses = newComponents.map((c) => { return { compid: c.compid, licenses: c.licenses }; });

        attach = [...attach, ...newComponentLicenses];

        // Attach licenses to components
        await modelProvider.model.license.attachLicensesToComponentBulk(attach);

        const newComponentCatalog = await modelProvider.model.component.getAll(null);
        newComponentCatalog.forEach((c) => {
          componentMapper.set(`${c.purl}@${c.version}`, c);
        });
      }

      const inventories = [];
      for (const dep of dependencies) {
        inventories.push({
          cvid: componentMapper.get(`${dep.purl}@${dep.version}`).compid,
          spdxid: dep.licenses[0],
          source: 'declared',
          usage: 'dependency',
        });
      }

      await modelProvider.model.inventory.createBatch(inventories);

      return dependencies;
    } catch (error: any) {
      log.error(error);
      throw error;
    }
  }

  public async reject(dependencyId: number): Promise<Dependency> {
    const rejectedDependency = await this.rejectAllByIds([dependencyId]);
    return rejectedDependency[0];
  }

  public async rejectAllByIds(dependencyIds: Array<number>): Promise<Array<Dependency>> {
    const dependencyCatalog = (await this.getAll(null));
    const idsMapper = new Set<Number>(dependencyIds);
    const dependenciesToReject = dependencyCatalog.filter((d) => idsMapper.has(d.dependencyId));

    const rejectedDependencies = dependenciesToReject.map((d) => {
      return { ...d,
        ...{ rejectedAt: new Date().toISOString(),
          status: FileStatusType.ORIGINAL as FileStatusType.ORIGINAL,
        },
      };
    });

    await modelProvider.model.dependency.updateBulk(rejectedDependencies);

    return rejectedDependencies;
  }

  public async rejectAllByPath(path: string): Promise<Array<Dependency>> {
    const dependencies = await this.getAll({ path });
    const dependencyIds = dependencies.filter((d) => d.status === FileStatusType.PENDING).map((d) => d.dependencyId);
    return this.rejectAllByIds(dependencyIds);
  }

  public async acceptAllByPath(path: string): Promise<Array<Dependency>> {
    try {
      let dependencies = await this.getAll({ path });
      dependencies = dependencies.filter((d) => d.status === FileStatusType.PENDING && d.valid === true);
      return await this.acceptAllByIds(dependencies);
    } catch (error: any) {
      log.error(error);
      throw error;
    }
  }

  public async getSummary(): Promise<Array<DependencyManifestFile>> {
    try {
      const filter = workspace.getOpenedProjects()[0].getGlobalFilter();
      console.log('Called dependencyService.getSummary()');
      console.log('filter from dependencyService: ', filter);

      if (filter?.usage && filter.usage !== FileUsageType.DEPENDENCY) { return []; }

      const input = filter?.path ? filter.path : '';
      const modelSummary: Array<ModelDependencyManifest> = await modelProvider.model.dependency.getSummary(input);

      const dependencyManifestFiles: DependencyManifestFile[] = modelSummary.map((d: ModelDependencyManifest): DependencyManifestFile => ({
        fileId: d.fileId,
        path: d.path,
        summary: {
          identified: d.identified,
          ignored: d.ignored,
          pending: d.pending,
        },
      }));

      if (filter?.status && filter.status === FileStatusType.ORIGINAL) {
        return dependencyManifestFiles.filter((d) => d.summary.ignored > 0);
      }

      if (filter?.status && filter.status === FileStatusType.IDENTIFIED) {
        return dependencyManifestFiles.filter((d) => d.summary.identified > 0);
      }

      if (filter?.status && filter.status === FileStatusType.PENDING) {
        return dependencyManifestFiles.filter((d) => d.summary.pending > 0);
      }

      return dependencyManifestFiles;
    } catch (error: any) {
      log.error(error);
      throw error;
    }
  }
}

export const dependencyService = new DependencyService();
