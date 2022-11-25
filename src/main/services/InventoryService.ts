import log from 'electron-log';
import { modelProvider } from './ModelProvider';
import { Inventory, Component, IBatchInventory, IWorkbenchFilter } from '../../api/types';
import { inventoryHelper } from '../helpers/InventoryHelper';
import { QueryBuilderCreator } from '../model/queryBuilder/QueryBuilderCreator';

class InventoryService  {
  public async get(inv: Partial<Inventory>): Promise<Inventory> {
    try {
      const inventory = (await modelProvider.model.inventory.getById(inv.id)) as Inventory;
      const comp: Component = (await modelProvider.model.component.get(inventory.cvid)) as Component;
      inventory.component = comp as Component;
      const files: any = await modelProvider.model.inventory.getInventoryFiles(inventory);
      inventory.files = files;
      return inventory;
    } catch (err: any) {
      return err;
    }
  }

  public async detach(inv: Partial<Inventory>): Promise<boolean> {
    try {
      await modelProvider.model.file.restore(inv.files);
      await modelProvider.model.inventory.detachFileInventory(inv);
      const emptyInv: any = await modelProvider.model.inventory.emptyInventory();
      if (emptyInv) {
        const result = emptyInv.map((item: Record<string, number>) => item.id);
        await modelProvider.model.inventory.deleteAllEmpty(result);
      }
      return true;
    } catch (err: any) {
      return err;
    }
  }

  public async delete(inv: Partial<Inventory>): Promise<boolean> {
    try {
      const success: boolean = await modelProvider.model.inventory.delete(inv);
      return success;
    } catch (err: any) {
      return err;
    }
  }

  private async isInventory(inventory: Partial<Inventory>): Promise<Partial<Inventory>> {
    try {
      const inv: Partial<Inventory> = await modelProvider.model.inventory.isInventory(inventory);
      return inv;
    } catch (err: any) {
      return err;
    }
  }

  public async create(inventory: Partial<Inventory>): Promise<Inventory> {
    try {
      const component: any = await modelProvider.model.component.getbyPurlVersion({
        purl: inventory.purl,
        version: inventory.version,
      });
      inventory.cvid = component.compid;
      const inv = await this.isInventory(inventory);
      if (!inv) {
        // eslint-disable-next-line no-param-reassign
        inventory = (await modelProvider.model.inventory.create(inventory)) as Inventory;
      } else inventory.id = inv.id;
      await this.attach(inventory);
      inventory.component = component as Component;
      return inventory as Inventory;
    } catch (error: any) {
      log.error(error);
      return error;
    }
  }

  public async InventoryBatchCreate(inv: Array<Partial<Inventory>>): Promise<Array<Inventory>> {
    const inventory: Array<Inventory> = (await modelProvider.model.inventory.createBatch(inv)) as Array<Inventory>;
    return inventory;
  }

  public async InventoryAttachFileBatch(data: any): Promise<boolean> {
    await modelProvider.model.file.identified(data.files);
    const success: boolean = await modelProvider.model.inventory.attachFileInventoryBatch(data);
    return success;
  }

  public async getAll(inventory: Partial<Inventory>): Promise<Array<Inventory>> {
    try {
      let inventories: any;
      if (inventory.purl && inventory.version) {
        inventories = await modelProvider.model.inventory.getByPurlVersion(inventory);
      } else if (inventory.files) {
        inventories = await modelProvider.model.inventory.getByResultId(inventory);
      } else if (inventory.purl) {
        inventories = await modelProvider.model.inventory.getByPurl(inventory);
      } else inventories = await modelProvider.model.inventory.getAll();
      if (inventory !== undefined) {
        const component: any = await modelProvider.model.component.getAll();
        const compObj = component.reduce((acc, comp) => {
          acc[comp.compid] = comp;
          return acc;
        }, {});
        for (let i = 0; i < inventories.length; i += 1) {
          inventories[i].component = compObj[inventories[i].cvid];
        }
        return inventories;
      }
      return [];
    } catch (error: any) {
      log.error(error);
      return error;
    }
  }

  public async attach(inv: Partial<Inventory>): Promise<boolean> {
    try {
      await modelProvider.model.file.identified(inv.files);
      const success: boolean = await modelProvider.model.inventory.attachFileInventory(inv);
      return success;
    } catch (err: any) {
      return err;
    }
  }

  public async preLoadInventoriesAcceptAll(
    data: Partial<IBatchInventory>,
    filter: IWorkbenchFilter
  ): Promise<Array<Partial<Inventory>>> {
    try {
      let queryBuilder = null;
      if (data.overwrite) queryBuilder = QueryBuilderCreator.create({ ...filter, path: data.source.input });
      else queryBuilder = QueryBuilderCreator.create({ ...filter, path: data.source.input, status: 'PENDING' });
      let files: any = await modelProvider.model.result.getResultsPreLoadInventory(queryBuilder);
      files = files.reduce((acc, curr) => {
        if(!acc[curr.id]) {
          const aux = {
            id: curr.id,
            source: curr.source,
            component: curr.component,
            version: curr.version,
            url: curr.url,
            purl: curr.purl,
            usage: curr.usage,
            spdxid: []
          };
          aux.spdxid.push(curr.spdxid);
          acc[curr.id] = aux;
        }
          else
            acc[curr.id].spdxid.push(curr.spdxid);
          return acc;
      },{});
      const components: any = await modelProvider.model.component.getAll(queryBuilder);
      let inventories = this.getPreLoadInventory(Object.values(files)) as Array<Partial<Inventory>>;
      inventories = inventoryHelper.AddComponentIdToInventory(components, inventories);
      return inventories;
    } catch (err: any) {
      return err;
    }
  }

  private getPreLoadInventory(results: any[]): Array<any> {
    const aux: any = {};
    const count = results.length;
    for (let i = 0; i < count; i += 1) {
      const spdx = results[i].spdxid.length > 0 ? results[i].spdxid[0] : '-';
      const key = `${results[i].component.toLowerCase()}${results[i].version}${spdx}${results[i].usage}`;
      if (!aux[key]) {
        aux[key] = {
          component: results[i].component,
          files: [results[i].id],
          purl: results[i].purl,
          usage: results[i].usage,
          version: results[i].version,
          url: results[i].url,
          spdxid: spdx === '-' ? null : spdx,
          cvid: 0,
        };
      } else aux[key].files.push(results[i].id);
    }
    return Object.values(aux);
  }

  public async update(inv: Inventory): Promise<Inventory> {
    try {
      // Validate new inventory
      let inventory: Inventory = (await modelProvider.model.inventory.get(inv)) as Inventory;
      const component: Component = (await modelProvider.model.component.getbyPurlVersion({
        purl: inv.purl,
        version: inv.version,
      })) as Component;
      const license = await modelProvider.model.license.getBySpdxId(inventory.spdxid);
      if (inventory && component && license) {
        inv.cvid = component.compid;
        inventory = await modelProvider.model.inventory.update(inv);
        inventory = (await modelProvider.model.inventory.get(inv)) as Inventory;
      } else throw new Error('Inventory not found');
      return inventory;
    } catch (err: any) {
      return err;
    }
  }


}

export const inventoryService = new InventoryService();
