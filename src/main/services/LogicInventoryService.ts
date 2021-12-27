import log from 'electron-log';
import { workspace } from '../workspace/Workspace';
import { Inventory, Component, IDb } from '../../api/types';

class LogicInventoryService {
  public async get(projectDb: IDb, inv: Partial<Inventory>): Promise<Inventory> {
    try {
      const inventory = (await projectDb.inventories.getById(inv.id)) as Inventory;
      const comp: Component = (await projectDb.components.get(inventory.cvid)) as Component;
      inventory.component = comp as Component;
      const files: any = await projectDb.inventories.getInventoryFiles(inventory);
      inventory.files = files;
      return inventory;
    } catch (err: any) {
      return err;
    }
  }

  public async detach(projectDb: IDb, inv: Partial<Inventory>): Promise<boolean> {
    try {
      const project = workspace.getOpenedProjects()[0];
      await projectDb.files.restore(inv.files);
      await projectDb.inventories.detachFileInventory(inv);
      const emptyInv: any = await projectDb.inventories.emptyInventory();
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

  private async isInventory(projectDb: IDb, inventory: Partial<Inventory>): Promise<Partial<Inventory>> {
    try {
      const inv: Partial<Inventory> = await projectDb.inventories.isInventory(inventory);
      return inv;
    } catch (err: any) {
      return err;
    }
  }

  public async create(projectDb: IDb, inventory: Partial<Inventory>): Promise<Inventory> {
    try {
      const component: any = await projectDb.components.getbyPurlVersion({
        purl: inventory.purl,
        version: inventory.version,
      });
      inventory.cvid = component.compid;
      const inv = await this.isInventory(projectDb, inventory);
      if (!inv) {
        // eslint-disable-next-line no-param-reassign
        inventory = (await projectDb.inventories.create(inventory)) as Inventory;
      } else inventory.id = inv.id;
      this.attach(projectDb, inventory);
      const comp: Component = (await projectDb.components.get(inventory.cvid)) as Component;
      inventory.component = comp;
      return inventory as Inventory;
    } catch (error: any) {
      log.error(error);
      return error;
    }
  }

  public async InventoryBatchCreate(projectDb: IDb, inv: Array<Partial<Inventory>>): Promise<Array<Inventory>> {
    const inventory: Array<Inventory> = (await projectDb.inventories.createBatch(inv)) as Array<Inventory>;
    return inventory;
  }

  public async InventoryAttachFileBatch(projectDb: IDb, data: any): Promise<boolean> {
    await projectDb.files.identified(data.files); 
    const success: boolean = await projectDb.inventories.attachFileInventoryBatch(data);
    return success;
  }

  public async getAll(projectDb: IDb, inventory: Partial<Inventory>): Promise<Array<Inventory>> {
    try {
      let inventories: any;
      if (inventory.purl && inventory.version) {
        inventories = await projectDb.inventories.getByPurlVersion(inventory);
      } else if (inventory.files) {
        inventories = await projectDb.inventories.getByResultId(inventory);
      } else if (inventory.purl) {
        inventories = await projectDb.inventories.getByPurl(inventory);
      } else inventories = await projectDb.inventories.getAll();
      if (inventory !== undefined) {
        const component: any = await projectDb.components.allComp(null);
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

  public async attach(projectDb: IDb, inv: Partial<Inventory>): Promise<boolean> {
    try {
      await projectDb.files.identified(inv.files);
      const success: boolean = await projectDb.inventories.attachFileInventory(inv);
      return success;
    } catch (err: any) {
      return err;
    }
  }
}

export const logicInventoryService = new LogicInventoryService();
