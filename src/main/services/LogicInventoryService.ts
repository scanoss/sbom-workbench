import log from 'electron-log';
import { workspace } from '../workspace/Workspace';
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

class LogicInventoryService {
  public async get(inv: Partial<Inventory>): Promise<Inventory> {
    try {
      const project = workspace.getOpenedProjects()[0];
      const inventory = (await project.scans_db.inventories.getById(inv.id)) as Inventory;
      const comp: Component = (await project.scans_db.components.get(inventory.cvid)) as Component;
      inventory.component = comp as Component;
      const files: any = await project.scans_db.inventories.getInventoryFiles(inventory);
      inventory.files = files;
      return inventory;
    } catch (err: any) {
      return err;
    }
  }

  public async detach(inv: Partial<Inventory>): Promise<boolean> {
    try {
      const project = workspace.getOpenedProjects()[0];
      await project.scans_db.files.restore(inv.files);
      await project.scans_db.inventories.detachFileInventory(inv);
      const emptyInv: any = await project.scans_db.inventories.emptyInventory();
      if (emptyInv) {
        const result = emptyInv.map((item: Record<string, number>) => item.id);
        await project.scans_db.inventories.deleteAllEmpty(result);
      }
      return true;
    } catch (err: any) {
      return err;
    }
  }

  public async delete(inv: Partial<Inventory>): Promise<boolean> {
    try {
      const success: boolean = await workspace.getOpenedProjects()[0].scans_db.inventories.delete(inv);
      return success;
    } catch (err: any) {
      return err;
    }
  }

  private async isInventory(inventory: Partial<Inventory>): Promise<Partial<Inventory>> {
    try {
      const project = workspace.getOpenedProjects()[0];
      const inv: Partial<Inventory> = await project.scans_db.inventories.isInventory(inventory);
      return inv;
    } catch (err: any) {
      return err;
    }
  }

  public async create(inventory: Partial<Inventory>): Promise<Inventory> {
    try {
      const project = workspace.getOpenedProjects()[0];
      const component: any = await project.scans_db.components.getbyPurlVersion({
        purl: inventory.purl,
        version: inventory.version,
      });
      inventory.cvid = component.compid;
      const inv = await this.isInventory(inventory);
      if (!inv) {
        // eslint-disable-next-line no-param-reassign
        inventory = (await project.scans_db.inventories.create(inventory)) as Inventory;
      } else inventory.id = inv.id;
      this.attach(inventory);
      const comp: Component = (await project.scans_db.components.get(inventory.cvid)) as Component;
      inventory.component = comp;
      return inventory as Inventory;
    } catch (error: any) {
      log.error(error);
      return error;
    }
  }

  public async InventoryBatchCreate(inv: Array<Partial<Inventory>>): Promise<Array<Inventory>> {
    const project = workspace.getOpenedProjects()[0];
    const inventory: Array<Inventory> = (await project.scans_db.inventories.createBatch(inv)) as Array<Inventory>;
    return inventory;
  }

  public async InventoryAttachFileBatch(data: any): Promise<boolean> {
    const project = workspace.getOpenedProjects()[0];
    await project.scans_db.files.identified(data.files);
    // await logicResultService.identified(data.files);
    const success: boolean = await project.scans_db.inventories.attachFileInventoryBatch(data);
    return success;
  }

  public async getAll(inventory: Partial<Inventory>): Promise<Array<Inventory>> {
    try {
      const project = workspace.getOpenedProjects()[0];
      let inventories: any;
      if (inventory.purl && inventory.version) {
        inventories = await project.scans_db.inventories.getByPurlVersion(inventory);
      } else if (inventory.files) {
        inventories = await project.scans_db.inventories.getByResultId(inventory);
      } else if (inventory.purl) {
        inventories = await project.scans_db.inventories.getByPurl(inventory);
      } else inventories = await project.scans_db.inventories.getAll();
      if (inventory !== undefined) {
        const component: any = await project.scans_db.components.allComp();
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
      const project = workspace.getOpenedProjects()[0];
      //  await logicResultService.identified(inv.files);
      await project.scans_db.files.identified(inv.files);
      const success: boolean = await project.scans_db.inventories.attachFileInventory(inv);
      return success;
    } catch (err: any) {
      return err;
    }
  }

  public async preLoadInventoriesAcceptAll(data: Partial<IFolderInventory>): Promise<Array<Partial<Inventory>>> {
    let filter: Filter = null;
    try {
      if (data.overwrite) filter = new GenericFilter('type', 'MATCH');
      else filter = new FilterAND( new GenericFilter('type', 'MATCH'), new GenericFilter('pending', 1));

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
            o.spdxid === result.spdxid.split(',')[0],
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
            spdxid: result.spdxid.split(',')[0],
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
