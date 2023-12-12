import { After } from '../../services/utils/hookAfter';
import { ITask } from '../Task';
import {
  Component,
  FileStatusType,
  Inventory,
  InventoryAction,
  InventoryKnowledgeExtraction,
  InventorySourceType,
  NewComponentDTO,
  ReuseIdentificationTaskDTO,
} from '../../../api/types';
import { modelProvider } from '../../services/ModelProvider';
import { ComponentSource, ComponentVersion } from '../../model/entity/ComponentVersion';
import { QueryBuilderMD5FileIn } from '../../model/queryBuilder/QueryBuilderMD5FileIn';
import { Accept } from '../../batch/Accept';
import { QueryBuilderCreator } from '../../model/queryBuilder/QueryBuilderCreator';
import { AddVulnerability } from '../../services/utils/vulnerability';
import { AddCrypto } from '../../services/utils/cryptography';

/**
 * @brief used to create new inventories from inventories extracted from another projects
 * */
export class ReuseIdentificationTask implements ITask<void, Array<Inventory>> {
  private readonly reuseIdentification : ReuseIdentificationTaskDTO;

  constructor(param: ReuseIdentificationTaskDTO) {
    this.reuseIdentification = param;
  }

  public async run() {
    // Import new data
    const uniqueComponents = this.getUniqueComponentsFromReuseIdentification(this.reuseIdentification.inventoryKnowledgeExtraction);
    const licenseMapper = await this.createNewLicenses(uniqueComponents);
    const reuseIdentificationComponents = await this.getReuseIdentificationComponents(uniqueComponents, licenseMapper);
    const newComponents = await this.createNewComponents(reuseIdentificationComponents.newComponents);
    reuseIdentificationComponents.newComponents = newComponents;

    // Creates new inventories from inventory knowledge extraction
    const componentMapper = this.getReuseIdentificationComponentsMapper(reuseIdentificationComponents);
    const fileMapper = await this.getFileMapper(this.reuseIdentification.inventoryKnowledgeExtraction);
    const inventories = await this.createNewInventories(fileMapper, componentMapper);
    return inventories;
  }

  /**
   * @brief Creates new inventories from in inventory knowledge extraction
   * @param fileMapper map of files in inventory knowledge extraction
   * @param componentMapper map of components in inventory knowledge extraction
   * @return Promise<Array<Inventory>> new inventories created in the database
   * */
  private async createNewInventories(fileMapper: Map<string, Array<number>>, componentMapper: Map<string, number>): Promise<Array<Inventory>> {
    const inventoryMapper = new Map<string, any>();
    for (const md5 of Object.keys(this.reuseIdentification.inventoryKnowledgeExtraction)) {
      const {
        purl, version, url, notes, usage, spdxid,
      } = this.reuseIdentification.inventoryKnowledgeExtraction[md5].inventories[0];
      const key = `${purl}${version}${notes}${spdxid}${usage}${url}`;
      if (inventoryMapper.has(key)) {
        inventoryMapper.get(key).files = inventoryMapper.get(key).files.concat(...fileMapper.get(md5));
      } else {
        const newInventory = {
          files: fileMapper.get(md5), cvid: componentMapper.get(`${purl}${version}`), notes, usage, url, spdxid,
        };
        inventoryMapper.set(key, newInventory);
      }
    }
    const inventories = Array.from(inventoryMapper.values());
    const newInventories = await new Accept({
      action: InventoryAction.ACCEPT,
      overwrite: this.reuseIdentification.overwrite,
      source: {
        type: this.reuseIdentification.type,
        input: this.reuseIdentification.type === InventorySourceType.PATH ? this.reuseIdentification.path : fileMapper.get(Object.keys(this.reuseIdentification.inventoryKnowledgeExtraction)[0]),
      },
    }, inventories, null).execute();
    return newInventories;
  }

  /**
   * @brief Get a mapper of files in the inventory  knowledge extraction
   * @param reuseIdentification inventory knowledge extraction
   * @return Promise<Map<string,Array<number>>> map with md5 file hash and the file id's
   * */
  private async getFileMapper(reuseIdentification: InventoryKnowledgeExtraction): Promise<Map<string, Array<number>>> {
    const md5Files = Object.keys(reuseIdentification);
    let queryBuilder = null;
    if (this.reuseIdentification.overwrite) {
      if (this.reuseIdentification.type !== InventorySourceType.PATH) queryBuilder = new QueryBuilderMD5FileIn(md5Files);
      else queryBuilder = QueryBuilderCreator.create({ path: this.reuseIdentification.path });
    } else if (this.reuseIdentification.type !== InventorySourceType.PATH) queryBuilder = QueryBuilderCreator.create({ md5: md5Files, status: FileStatusType.PENDING }); // Get only those files which status is pending
    else queryBuilder = QueryBuilderCreator.create({ path: this.reuseIdentification.path, status: FileStatusType.PENDING });
    const files = await modelProvider.model.file.getAll(queryBuilder);
    const fileMapper = new Map<string, Array<number>>();
    files.forEach((f) => {
      if (fileMapper.has(f.md5_file))fileMapper.get(f.md5_file).push(f.id);
      else fileMapper.set(f.md5_file, [f.id]);
    });
    return fileMapper;
  }

  /**
   * @brief Get a mapper of all components extracted
   * @param reuseComponent Object with contains existing in the database and new components extracted
   * @return Map<string,number> map with purl version of each component and their id
   * */
  private getReuseIdentificationComponentsMapper(reuseComponent: Record<string, Array<any>>): Map<string, number> {
    const componentMapper = new Map<string, number>();
    reuseComponent.existingComponents.forEach((c) => componentMapper.set(`${c.purl}${c.version}`, c.compid));
    reuseComponent.newComponents.forEach((c) => componentMapper.set(`${c.purl}${c.version}`, c.id));
    return componentMapper;
  }

  /**
   * @brief Removes repeated components in from the Inventory knowledge extraction
   * @param reuseIdentification inventory knowledge extraction from other projects
   * @return Array<any> return array of unique components
   * */
  private getUniqueComponentsFromReuseIdentification(reuseIdentification: InventoryKnowledgeExtraction): Array<any> {
    const uniqueComponents = new Map<string, any>();
    for (const ri of Object.values(reuseIdentification)) {
      for (let j = 0; j < ri.inventories.length; j += 1) {
        const {
          purl, version, spdxid, url, name, licenseName,
        } = ri.inventories[j];
        if (!uniqueComponents.has(`${purl}${version}`)) {
          uniqueComponents.set(`${purl}${version}`, {
            purl, version, url, name, licenses: [{ spdxid, name: licenseName }],
          });
        } else {
          uniqueComponents.get(`${purl}${version}`).licenses.push({ spdxid, name: licenseName });
        }
      }
    }
    return Array.from(uniqueComponents.values());
  }

  /**
   * @brief Creates new licenses from components extracted
   * @param components Array of unique components
   * @return Promise<Map<string,number>>  return a map with spdxid and licende id of all licenses
   * */
  private async createNewLicenses(components: Array<any>): Promise<Map<string, number>> {
    const localLicenses = await modelProvider.model.license.getAll();
    const localLicensesMapper = new Map <string, number>();
    localLicenses.forEach((l) => localLicensesMapper.set(l.spdxid, l.id));
    for (let i = 0; i < components.length; i += 1) {
      for (let j = 0; j < components[i].licenses; j += 1) {
        const { spdxid, name } = components[i].licenses[j];
        if (!localLicensesMapper.has(components[i].licenses[j].spdxid)) {
          const newLicense = await modelProvider.model.license.create({ name, spdxid, fulltext: 'IMPORTED' });
          localLicensesMapper.set(newLicense.spdxid, newLicense.id);
        }
      }
    }
    return localLicensesMapper;
  }

  /**
   * @brief Get the new and the local components contained in the extraction
   * @param uniqueComponents Array of unique components (purl and version) extracted from another projects
   * @param licenseMapper map which contains the spdxid and the license id
   * @return Record<string, Array<any>>  return an object with existing components in the local database and the new components to be added in the database
   * */
  private async getReuseIdentificationComponents(uniqueComponents: Array<any>, licenseMapper: Map<string, number>): Promise<Record<string, Array<any>>> {
    const localComponents = await modelProvider.model.component.getAll(null);
    const localComponentsMapper = new Map<string, Component>();
    const components = {
      newComponents: [],
      existingComponents: [],
    };
    localComponents.forEach((c) => localComponentsMapper.set(`${c.purl}${c.version}`, c));
    for (let i = 0; i < uniqueComponents.length; i += 1) {
      const {
        purl, version, spdxid, url, name, licenses,
      } = uniqueComponents[i];
      if (localComponentsMapper.has(`${purl}${version}`)) components.existingComponents.push(localComponentsMapper.get(`${purl}${version}`));
      else {
        const comp = {
          name, versions: [{ version, licenses: [] }], purl, url,
        };
        for (let j = 0; j < licenses.length; j += 1) {
          comp.versions[0].licenses.push(licenseMapper.get(licenses[j].spdxid));
        }
        components.newComponents.push(comp);
      }
    }
    return components;
  }

  /**
 * @brief Creates new components in database
 * @param newComponents array of new components to be created
 * @return Array<ComponentVersion> ComponentVersion Array of component version created
 * */
  @After(AddVulnerability)
  @After(AddCrypto)
  private async createNewComponents(newComponents: Array<NewComponentDTO>): Promise <Array<ComponentVersion>> {
    const promises = [];
    newComponents.forEach((comp) => {
      const component = new ComponentVersion();
      promises.push(comp.versions.map((v) => {
        Object.assign(component, comp);
        component.version = v.version;
        component.source = ComponentSource.MANUAL;
        component.setLicenseIds(v.licenses);
        return modelProvider.model.component.create(component);
      }));
    });
    const newComp = [];
    for (let i = 0; i < promises.length; i += 1) {
      const results = await Promise.all(promises[i].map((p) => p.catch((e) => e)));
      const components = results.filter(
        (result) => !(result instanceof Error),
      );
      components.forEach((c) => newComp.push(c));
    }
    return newComp;
  }
}
