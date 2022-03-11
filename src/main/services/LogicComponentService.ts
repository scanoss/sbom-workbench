import log from 'electron-log';
import { Component, ComponentGroup, IWorkbenchFilter } from '../../api/types';
import { componentHelper } from '../helpers/ComponentHelper';
import { QueryBuilder } from '../queryBuilder/QueryBuilder';
import { QueryBuilderCreator } from '../queryBuilder/QueryBuilderCreator';
import { serviceProvider } from './ServiceProvider';

class LogicComponentService {
  public async getComponentFiles(data: Partial<Component>, filter: IWorkbenchFilter): Promise<any> {
    try {
      const params = { purl: data.purl, version: data.version, ...filter };
      const queryBuilder = QueryBuilderCreator.create(params);
      const files: any = await serviceProvider.model.file.getAll(queryBuilder);
      const inventories: any = await serviceProvider.model.inventory.getAll();
      const compid = inventories.map((inv) => inv.cvid);
      const queryComp = QueryBuilderCreator.create({ compid });
      const components = await serviceProvider.model.component.getAll(queryComp);

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

  public async getAll(params: IWorkbenchFilter) {
    try {
      const queryBuilder: QueryBuilder = QueryBuilderCreator.create(params);
      const queryBuilderSummary: QueryBuilder = QueryBuilderCreator.create({ ...params, status: null }); // Keep summary independent from summary
      let comp = await serviceProvider.model.component.getAll(queryBuilder);
      const summary = await serviceProvider.model.component.summary(queryBuilderSummary);
      comp = componentHelper.addSummary(comp, summary);
      const compPurl: any = this.groupComponentsByPurl(comp);
      comp = await this.mergeComponentByPurl(compPurl);
      comp = componentHelper.addSummaryByPurl(comp, summary);
      return comp;
    } catch (error: any) {
      log.error(error);
      return error;
    }
  }

  public async get(component: Partial<ComponentGroup>, params: IWorkbenchFilter) {
    try {
      const response = await this.getAll({ purl: component.purl, ...params });
      return response[0] || null;
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
      aux.totalFiles = 0;
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
          aux.totalFiles += iterator.summary.ignored + iterator.summary.pending + iterator.summary.identified;
          version.summary = iterator.summary;
          version.files = iterator.summary.ignored + iterator.summary?.pending + iterator.summary.identified;
        }
        version.version = iterator.version;
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
