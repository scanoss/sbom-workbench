import log from 'electron-log';
import { serviceProvider } from './ServiceProvider';
import { Inventory, Component, IFolderInventory, ComponentSource } from '../../api/types';
import { logicComponentService } from './LogicComponentService';
import { inventoryHelper } from '../helpers/InventoryHelper';


class LogicInventoryService {
  public async get(inv: Partial<Inventory>): Promise<Inventory> {
    try {
      const inventory = (await serviceProvider.model.inventory.getById(inv.id)) as Inventory;
      const comp: Component = (await serviceProvider.model.component.get(inventory.cvid)) as Component;
      inventory.component = comp as Component;
      const files: any = await serviceProvider.model.inventory.getInventoryFiles(inventory);
      inventory.files = files;
      return inventory;
    } catch (err: any) {
      return err;
    }
  }

  public async detach(inv: Partial<Inventory>): Promise<boolean> {
    try {
      await serviceProvider.model.file.restore(inv.files);
      await serviceProvider.model.inventory.detachFileInventory(inv);
      const emptyInv: any = await serviceProvider.model.inventory.emptyInventory();
      if (emptyInv) {
        const result = emptyInv.map((item: Record<string, number>) => item.id);
        await serviceProvider.model.inventory.deleteAllEmpty(result);
      }
      return true;
    } catch (err: any) {
      return err;
    }
  }

  public async delete(inv: Partial<Inventory>): Promise<boolean> {
    try {
      const success: boolean = await serviceProvider.model.inventory.delete(inv);
      return success;
    } catch (err: any) {
      return err;
    }
  }

  private async isInventory(inventory: Partial<Inventory>): Promise<Partial<Inventory>> {
    try {
      const inv: Partial<Inventory> = await serviceProvider.model.inventory.isInventory(inventory);
      return inv;
    } catch (err: any) {
      return err;
    }
  }

  public async create(inventory: Partial<Inventory>): Promise<Inventory> {
    try {
      const component: any = await serviceProvider.model.component.getbyPurlVersion({
        purl: inventory.purl,
        version: inventory.version,
      });
      inventory.cvid = component.compid;
      const inv = await this.isInventory(inventory);
      if (!inv) {
        // eslint-disable-next-line no-param-reassign
        inventory = (await serviceProvider.model.inventory.create(inventory)) as Inventory;
      } else inventory.id = inv.id;
      this.attach(inventory);
      const comp: Component = (await serviceProvider.model.component.get(inventory.cvid)) as Component;
      inventory.component = comp;
      return inventory as Inventory;
    } catch (error: any) {
      log.error(error);
      return error;
    }
  }

  public async InventoryBatchCreate(inv: Array<Partial<Inventory>>): Promise<Array<Inventory>> {
    const inventory: Array<Inventory> = (await serviceProvider.model.inventory.createBatch(inv)) as Array<Inventory>;
    return inventory;
  }

  public async InventoryAttachFileBatch(data: any): Promise<boolean> {
    await serviceProvider.model.file.identified(data.files);
    const success: boolean = await serviceProvider.model.inventory.attachFileInventoryBatch(data);
    return success;
  }

  public async getAll(inventory: Partial<Inventory>): Promise<Array<Inventory>> {
    try {
      let inventories: any;
      if (inventory.purl && inventory.version) {
        inventories = await serviceProvider.model.inventory.getByPurlVersion(inventory);
      } else if (inventory.files) {
        inventories = await serviceProvider.model.inventory.getByResultId(inventory);
      } else if (inventory.purl) {
        inventories = await serviceProvider.model.inventory.getByPurl(inventory);
      } else inventories = await serviceProvider.model.inventory.getAll();
      if (inventory !== undefined) {
        const component: any = await serviceProvider.model.component.allComp(null);
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
      await serviceProvider.model.file.identified(inv.files);
      const success: boolean = await serviceProvider.model.inventory.attachFileInventory(inv);
      return success;
    } catch (err: any) {
      return err;
    }
  }

  public async preLoadInventoriesAcceptAll(data: Partial<IFolderInventory>): Promise<Array<Partial<Inventory>>> {
    try {
      const files: any = await this.getResultsPreLoadInventory(data);
      const components: any = await logicComponentService.getAll({ source: ComponentSource.ENGINE });
      let inventories = this.getPreLoadInventory(files) as Array<Partial<Inventory>>;
      inventories = inventoryHelper.AddComponentIdToInventory(components, inventories);

      return inventories;
    } catch (err: any) {
      return err;
    }
  }

  private async getResultsPreLoadInventory(params: Partial<IFolderInventory>) {
    try {
      let data: any;
      if (params.overwrite) data = await serviceProvider.model.result.getByFolder(params.folder);
      else data = await serviceProvider.model.result.getByFolderPending(params.folder);

      return data;
    } catch (err: any) {
      return err;
    }
  }

  private getPreLoadInventory(results: any[]): Array<any> {
    const aux: any = {};
    const count = results.length;
    for (let i = 0; i < count; i += 1) {
      const spdx = results[i].spdxid?.split(',')[0] ? results[i].spdxid.split(',')[0] : '-';
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
}

export const logicInventoryService = new LogicInventoryService();
