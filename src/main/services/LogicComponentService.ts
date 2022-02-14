import log from 'electron-log';
import { Component, ComponentGroup, ComponentParams } from '../../api/types';
import { componentHelper } from '../helpers/ComponentHelper';
import { serviceProvider } from './ServiceProvider';

class LogicComponentService {
  public async getAll(data: any, params?: ComponentParams): Promise<Component> {
    try {
      let component: any;
      if (data.purl && data.version) component = await serviceProvider.model.component.getbyPurlVersion(data);
      else if (data.purl) {
        component = await serviceProvider.model.component.getByPurl(data, params);
      } else {
        component = await serviceProvider.model.component.allComp(params);
      }
      if (component !== undefined) return component;
      throw new Error('Component not found');
    } catch (error: any) {
      log.error(error);
      return error;
    }
  }

  public async getComponentFiles(data: Partial<Component>, params: any): Promise<any> {
    try {
      let files: any;
      if (data.purl && data.version)
        files = await serviceProvider.model.file.getByPurlVersion(data, params ? params.path : null);
      else files = await serviceProvider.model.file.getByPurl(data, params ? params.path : null);
      const components: any = await this.getAll({});
      const inventories: any = await serviceProvider.model.inventory.getAll();
      const index = inventories.reduce((acc, inventory) => {
        acc[inventory.id] = inventory;
        return acc;
      }, {});

      for (let i = 0; i < files.length; i += 1) {
        if (files[i].inventoryid) {
          files[i].inventory = index[files[i].inventoryid];
          files[i].component = components.find((component: any) => files[i].inventory.cvid === component.compid);
        }

        if (files[i].license) files[i].license = files[i].license.split(',');
      }
      return files;
    } catch (error: any) {
      log.error(error);
      return error;
    }
  }

  public async getAllComponentGroup(params: ComponentParams) {
    try {
      const data = await this.getAll({}, params);
      if (data) {
        const compPurl: any = this.groupComponentsByPurl(data);
        const comp: any = await this.mergeComponentByPurl(compPurl);
        // if path is defined
        if (params?.path !== undefined) {
          const purls = comp.reduce((acc, curr) => {
            acc.push(curr.purl);
            return acc;
          }, []);
          const aux = await serviceProvider.model.component.getSummaryByPath(params.path, purls);
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

  public async getComponentGroup(component: Partial<ComponentGroup>, params: ComponentParams) {
    try {
      const data = await this.getAll(component, params);
      if (data) {
        const compPurl: any = this.groupComponentsByPurl(data);
        const [comp]: any = await this.mergeComponentByPurl(compPurl);
        if (!comp) {
          return [];
        }
        comp.summary = await serviceProvider.model.component.summaryByPurl(comp);
        if (params?.path) {
          const aux = await serviceProvider.model.component.getSummaryByPath(params.path, [comp.purl]);
          const summary = componentHelper.summaryByPurl(aux);
          comp.summary = summary[comp.purl];
        }
        return comp;
      }
      return [];
    } catch (error: any) {
      log.error(error);
      return error;
    }
  }

  private groupComponentsByPurl(data: any) {
    try {
      const aux = {};
      for (const component of data) {
        if (!aux[component.purl]) aux[component.purl] = [];
        aux[component.purl].push(component);
      }
      return aux;
    } catch (err) {
      log.error(err);
      return 'Unable to group components';
    }
  }

  private async mergeComponentByPurl(data: Record<string, any>) {
    const overrideComponents = await this.getOverrideComponents();
    const result: any[] = [];
    for (const [key, value] of Object.entries(data)) {
      const aux: any = {};
      aux.summary = { ignored: 0, pending: 0, identified: 0 };
      aux.versions = [];
      for (const iterator of value) {
        aux.identifiedAs = overrideComponents[iterator.purl] ? overrideComponents[iterator.purl] : [];
        aux.name = iterator.name;
        aux.purl = iterator.purl;
        aux.url = iterator.url;
        aux.vendor = iterator.vendor;
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
    result.forEach((comp) => comp.versions.sort((a, b) => b.version.localeCompare(a.version)));
    return result;
  }

  public async importComponents() {
    try {
      const components: Array<Partial<Component>> =
        await serviceProvider.model.component.getUniqueComponentsFromResults();
      await serviceProvider.model.component.import(components);
      const componentLicenses = await serviceProvider.model.component.getLicensesAttachedToComponentsFromResults();
      await serviceProvider.model.license.bulkAttachComponentLicense(componentLicenses);
      return true;
    } catch (error: any) {
      return error;
    }
  }

  private async getOverrideComponents() {
    try {
      const overrideComponents = await serviceProvider.model.component.getOverrideComponents();
      let result: any = {};
      if (overrideComponents.length > 0) {
        result = overrideComponents.reduce((acc, curr) => {
          if (!acc[curr.matchedPurl]) acc[curr.matchedPurl] = [];
          acc[curr.matchedPurl].push({ purl: curr.overridePurl, name: curr.overrideName });
          return acc;
        }, {});
      }
      return result;
    } catch (error) {
      log.error(error);
      return error;
    }
  }
}

export const logicComponentService = new LogicComponentService();
