import log from 'electron-log';
import { serviceProvider } from './ServiceProvider';
import { Inventory, Component, IFolderInventory } from '../../api/types';
import { logicResultService } from './LogicResultService';
import { FilterAND } from '../batch/Filter/FilterAND';
import { FilterNOT } from '../batch/Filter/FilterNOT';
import { GenericFilter } from '../batch/Filter/GenericFilter';
import { utilHelper } from '../helpers/UtilHelper';
// eslint-disable-next-line import/no-cycle
import { logicComponentService } from './LogicComponentService';
import { Filter } from '../batch/Filter/Filter';
import { ComponentSource } from '../db/scan_component_db';
import { inventoryHelper } from '../helpers/InventoryHelper';
import { Restore } from '../batch/Restore';

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

  public async preLoadInventoriesAcceptAll(data :Partial<IFolderInventory>): Promise<Array<Partial<Inventory>>> {
    try {
      if (data.overwrite) {
        await new Restore(data.folder, data.overwrite).execute();
      }
      const filter = new FilterAND(new FilterNOT(new GenericFilter('usage', 'none')), new GenericFilter('pending', 1));
      const files: any = await logicResultService.getFilesInFolder(data.folder);
      const ids = utilHelper.getArrayFromObjectFilter(files, 'id', filter);
      const components: any = await logicComponentService.getAll({ source: ComponentSource.ENGINE });
      if (ids.length === 0) return [];
      let inventories = this.getFilteredObject(files, filter) as Array<Partial<Inventory>>;

      inventories = inventoryHelper.AddComponentIdToInventory(components, inventories);
      return inventories;
    } catch (err: any) {
      return err;
    }
  }

  private getFilteredObject(results: any[], filter: Filter): Array<any> {
    const array: any = [];
    results.forEach((result) => {
      if (filter.isValid(result)) {
        const index = array.findIndex(
          (o) =>
            o.component === result.component &&
            o.version === result.version &&
            o.purl === result.purl &&
            o.usage === result.usage &&
            o.license === result.license &&
            o.spdxid === result.spdxid
        );

        if (index >= 0) {
          array[index].files.push(result.id);
        } else {
          const aux = {
            component: result.component,
            files: [result.id],
            purl: result.purl,
            usage: result.usage,
            version: result.version,
            url: result.url,
            spdxid: result.spdxid,
            cvid: 0,
          };

          array.push(aux);
        }
      }
    });
    return array;
  }
}

export const logicInventoryService = new LogicInventoryService();
