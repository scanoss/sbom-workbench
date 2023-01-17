import log from 'electron-log';
import {
  Component,
  ComponentGroup,
  IWorkbenchFilterParams,
} from '../../api/types';
import { componentHelper } from '../helpers/ComponentHelper';
import { QueryBuilder } from '../model/queryBuilder/QueryBuilder';
import { QueryBuilderCreator } from '../model/queryBuilder/QueryBuilderCreator';
import { workspace } from '../workspace/Workspace';
import { modelProvider } from './ModelProvider';
import { ComponentAdapter } from '../adapters/ComponentAdapter';
import { AddVulneravilityTask } from '../task/vulnerability/AddVulneravilityTask';
import {
  ComponentSource,
  ComponentVersion,
} from '../model/entity/ComponentVersion';
import { NewComponentDTO } from '../../api/dto';

class ComponentService {
  public async getComponentFiles(
    data: Partial<Component>,
    params: IWorkbenchFilterParams
  ): Promise<any> {
    try {
      const filter = workspace.getOpenedProjects()[0].getFilter(params);
      const queryBuilder = QueryBuilderCreator.create({
        purl: data.purl,
        version: data.version,
        ...filter,
      });
      let files: any = await modelProvider.model.result.getAll(queryBuilder);
      files = new ComponentAdapter().componentFileAdapter(files);
      const inventories: any = await modelProvider.model.inventory.getAll();
      const compid = inventories.map((inv) => inv.cvid);
      const queryComp = QueryBuilderCreator.create({ compid });
      const components = await modelProvider.model.component.getAll(queryComp);

      const index = inventories.reduce((acc, inventory) => {
        acc[inventory.id] = inventory;
        return acc;
      }, {});
      for (let i = 0; i < files.length; i += 1) {
        if (files[i].inventoryid) {
          files[i].inventory = index[files[i].inventoryid];
          files[i].component = components.find(
            (component: any) => files[i].inventory.cvid === component.compid
          );
        }
      }
      return files;
    } catch (error: any) {
      log.error(error);
      return error;
    }
  }

  public async getAll(params: IWorkbenchFilterParams) {
    try {
      const filter = workspace.getOpenedProjects()[0].getFilter(params);
      const queryBuilder: QueryBuilder = QueryBuilderCreator.create(filter);
      const queryBuilderSummary: QueryBuilder = QueryBuilderCreator.create({
        ...filter,
        status: null,
      }); // Keep summary independent of summary
      let comp = await modelProvider.model.component.getAll(queryBuilder);
      const summary = await modelProvider.model.component.summary(
        queryBuilderSummary
      );
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

  public async get(
    component: Partial<ComponentGroup>,
    params: IWorkbenchFilterParams
  ) {
    try {
      const p = workspace.getOpenedProjects()[0];
      const workbenchFilter = p.getFilter(params);
      const filter = { purl: component.purl, ...workbenchFilter };
      const response = await this.getAll({ unique: params.unique, filter });
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
        aux.identifiedAs = overrideComponents[iterator.purl]
          ? overrideComponents[iterator.purl]
          : [];
        aux.name = iterator.name;
        aux.purl = iterator.purl;
        aux.url = iterator.url;
        aux.vendor = iterator.vendor;
        const version: any = {};
        if (iterator.summary) {
          aux.summary.ignored += iterator.summary.ignored;
          aux.summary.pending += iterator.summary.pending;
          aux.summary.identified += iterator.summary.identified;
          aux.totalFiles +=
            iterator.summary.ignored +
            iterator.summary.pending +
            iterator.summary.identified;
          version.summary = iterator.summary;
          version.files =
            iterator.summary.ignored +
            iterator.summary?.pending +
            iterator.summary.identified;
        }
        version.version = iterator.version;
        version.licenses = [];
        version.licenses = iterator.licenses;
        version.cvid = iterator.compid;
        version.reliableLicense = iterator.reliableLicense;
        aux.versions.push(version);
      }
      result.push(aux);
    }
    result.sort((a, b) => a.name.localeCompare(b.name));
    result.forEach((comp) =>
      comp.versions.sort((a, b) => b.version.localeCompare(a.version))
    );
    return result;
  }

  public async importComponents() {
    try {
      const components: Array<Partial<Component>> = await modelProvider.model.component.getUniqueComponentsFromResults();
      await modelProvider.model.component.import(components);
      const data =
        await modelProvider.model.component.getLicensesAttachedToComponentsFromResults();
      const componentLicenses = new ComponentAdapter().componentLicenses(data);
      await modelProvider.model.license.bulkAttachComponentLicense(
        componentLicenses
      );
      // Add most reliable license to each component
      const componentReliableLicense =
        await modelProvider.model.component.getMostReliableLicensePerComponent();
      await modelProvider.model.component.updateMostReliableLicense(
        componentReliableLicense
      );
      return true;
    } catch (error: any) {
      return error;
    }
  }

  private async getOverrideComponents() {
    try {
      const overrideComponents =
        await modelProvider.model.component.getOverrideComponents();
      let result: any = {};
      if (overrideComponents.length > 0) {
        result = overrideComponents.reduce((acc, curr) => {
          if (!acc[curr.matchedPurl]) acc[curr.matchedPurl] = [];
          acc[curr.matchedPurl].push({
            purl: curr.overridePurl,
            name: curr.overrideName,
          });
          return acc;
        }, {});
      }
      return result;
    } catch (error) {
      log.error(error);
      return error;
    }
  }

  public async create(
    newComp: NewComponentDTO
  ): Promise<Partial<ComponentGroup>> {
    const promises = newComp.versions.map((v) => {
      const component = new ComponentVersion();
      Object.assign(component, newComp);
      component.version = v.version;
      component.setLicenseIds(v.licenses);
      component.source = ComponentSource.MANUAL;
      return modelProvider.model.component.create(component);
    });
    const results = await Promise.all(promises.map((p) => p.catch((e) => e)));
    const validComponents = results.filter(
      (result) => !(result instanceof Error)
    );
    if (results.length - validComponents.length === newComp.versions.length)
      throw new Error('Component already exists');
    const component = await modelProvider.model.component.getAll(
      QueryBuilderCreator.create({ purl: newComp.purl })
    );
    const compPurl: any = this.groupComponentsByPurl(component);
    const response = await this.mergeComponentByPurl(compPurl);

    // TODO: Uncomment code when gRPC service is integrated
    // Adds component's vulnerabilities
    const addVulnerability = new AddVulneravilityTask();
    await addVulnerability.run(this.adaptToVulnerabilityTask(newComp));
    return response[0];
  }

  private adaptToVulnerabilityTask(component: NewComponentDTO): Array<string> {
    const response = component.versions.map(
      (v) => `${component.purl}@${v.version}`
    );
    return response;
  }
}

export const componentService = new ComponentService();
