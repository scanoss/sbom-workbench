import log from 'electron-log';
import { Component, ComponentGroup, ComponentParams, IDb } from '../../api/types';
import { componentHelper } from '../helpers/ComponentHelper';
// import { workspace } from '../workspace/Workspace';

class LogicComponentService {
  public async getAll(projectDb: IDb, data: any, params?: ComponentParams): Promise<Component> {
    try {
      // const project = workspace.getOpenedProjects()[0];
      let component: any;
      if (data.purl && data.version) component = await projectDb.components.getbyPurlVersion(data);
      else if (data.purl) {
        component = await projectDb.components.getByPurl(data, params);
      } else {
        component = await projectDb.components.allComp(params);
      }
      if (component !== undefined) return component;
      throw new Error('Component not found');
    } catch (error: any) {
      log.error(error);
      return error;
    }
  }

  public async getComponentFiles(projectDb: IDb, data: Partial<Component>, params: any): Promise<any> {
    try {
      // const project = workspace.getOpenedProjects()[0];
      let files: any;
      if (data.purl && data.version) files = await projectDb.files.getByPurlVersion(data, params ? params.path : null);
      else files = await projectDb.files.getByPurl(data, params ? params.path : null);

      const components: any = await this.getAll(projectDb, {
        purl: data.purl,
        version: data.version,
      });
      const inventories: any = await projectDb.inventories.getAll();
      const index = inventories.reduce((acc, inventory) => {
        acc[inventory.id] = inventory;
        return acc;
      }, {});
      for (let i = 0; i < files.length; i += 1) {
        if (data.purl && data.version) files[i].component = [components];
        else files[i].component = components.find((component: any) => files[i].version === component.version);
        if (files[i].inventoryid) files[i].inventory = index[files[i].inventoryid];
        files[i].license = files[i].license.split(',');
      }
      return files;
    } catch (error: any) {
      log.error(error);
      return error;
    }
  }

  public async getAllComponentGroup(projectDb: IDb, params: ComponentParams) {
    try {
      // const project = workspace.getOpenedProjects()[0];
      const data = await this.getAll(projectDb, {}, params);
      if (data) {
        const comp: any = await this.groupComponentsByPurl(data); //
        // if path is defined
        if (params?.path !== undefined) {
          const purls = comp.reduce((acc, curr) => {
            acc.push(curr.purl);
            return acc;
          }, []);
          const aux = await projectDb.components.getSummaryByPath(params.path, purls);
          const summary = componentHelper.summaryByPurl(aux);
          for (let i = 0; i < comp.length; i += 1) {
            comp[i].summary = summary[comp[i].purl];
          }
        }
        return comp;
      }
      return [];
    } catch (error: any) {
      return error;
    }
  }

  public async getComponentGroup(projectDb: IDb, component: Partial<ComponentGroup>, params: ComponentParams) {
    try {
      // const project = workspace.getOpenedProjects()[0];

      const data = await this.getAll(projectDb, component, params);
      if (data) {
        const [comp] = await this.groupComponentsByPurl(data);
        if (!comp) {
          // log.error('Comp not found',data);
          return [];
        }
        comp.summary = await projectDb.components.summaryByPurl(comp);
        if (params?.path) {
          const aux = await projectDb.components.getSummaryByPath(params.path, [comp.purl]);
          const summary = componentHelper.summaryByPurl(aux);
          comp.summary = summary[comp.purl];
        }
        return comp;
      }
      return [];
    } catch (error: any) {
      // log.error(error);
      return error;
    }
  }

  private async groupComponentsByPurl(data: any) {
    try {
      const aux = {};
      for (const component of data) {
        if (!aux[component.purl]) aux[component.purl] = [];
        aux[component.purl].push(component);
      }
      const result = await this.mergeComponentByPurl(aux);
      return result;
    } catch (err) {
      // log.error(err);
      return 'Unable to group components';
    }
  }

  private mergeComponentByPurl(data: Record<string, any>) {
    const result: any[] = [];
    for (const [key, value] of Object.entries(data)) {
      const aux: any = {};
      aux.summary = { ignored: 0, pending: 0, identified: 0 };
      aux.versions = [];
      for (const iterator of value) {
        aux.name = iterator.name;
        aux.purl = iterator.purl;
        aux.url = iterator.url;
        const version: any = {};
        if (iterator.summary) {
          aux.summary.ignored += iterator.summary.ignored;
          aux.summary.pending += iterator.summary.pending;
          aux.summary.identified += iterator.summary.identified;
        }
        version.version = iterator.version;
        version.files = iterator.filesCount;
        version.licenses = [];
        version.licenses = iterator.licenses;
        version.cvid = iterator.compid;
        aux.versions.push(version);
      }
      result.push(aux);
    }
    result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }

  public async importComponents(projectDb: IDb) {
    // eslint-disable-next-line no-async-promise-executor
    try {
      const components: Array<Partial<Component>> = await projectDb.components.getUniqueComponentsFromResults();
      await projectDb.components.import(components);
      const componentLicenses = await projectDb.components.getLicensesAttachedToComponentsFromResults();
      await projectDb.licenses.bulkAttachComponentLicense(componentLicenses);
      return true;
    } catch (error: any) {
      return error;
    }
  }
}

export const logicComponentService = new LogicComponentService();
