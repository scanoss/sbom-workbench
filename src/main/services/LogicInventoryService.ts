import { workspace } from '../workspace/Workspace';
import { Inventory, Component } from '../../api/types';
import { inventoryService } from '../../api/inventory-service';

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
      await project.scans_db.results.restore(inv.files);
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

  public async create(inv: Partial<Inventory>): Promise<Inventory> {
    const project = workspace.getOpenedProjects()[0];
    const inventory: Inventory = (await project.scans_db.inventories.create(inv)) as Inventory;
    return inventory;
  }
}

export const logicInventoryService = new LogicInventoryService();
