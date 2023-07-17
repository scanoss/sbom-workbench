import { IBatchInventory, Inventory } from '../../api/types';
import { inventoryService } from '../services/InventoryService';
import { NodeStatus } from '../workspace/tree/Node';
import { Batch } from './Batch';
import { Restore } from './Restore';

export class Accept extends Batch {
  private inventories: Partial<Array<Inventory>>;

  private note: string;

  constructor(params: IBatchInventory, inventories: Partial<Array<Inventory>>, note: string) {
    super(params);
    this.note = note;
    this.inventories = inventories;
  }

  public async execute() {
    if (this.getOverWrite()) {
      await new Restore(this.getParams()).execute();
    }
    const ids = this.getFilesToUpdateFromInventories(this.inventories);
    if (this.note) {
      this.inventories.forEach((inventory) => {
        inventory.notes = this.note;
      });
    }
    const inv = await inventoryService.InventoryBatchCreate(this.inventories);
    const filesToUpdate: any = this.mergeFilesInventoryId(inv);
    filesToUpdate.files = ids;
    const success = await inventoryService.InventoryAttachFileBatch(filesToUpdate);
    if (success) {
      await this.updateTree(ids, NodeStatus.IDENTIFIED);
      return inv;
    }
    return null;
  }

  private getFilesToUpdateFromInventories(inventories: Array<Inventory>) {
    const files: Array<number> = [];
    inventories.forEach((inventory) => {
      files.push(...inventory.files);
    });
    return files;
  }

  private mergeFilesInventoryId(inventories: Array<Inventory>) {
    let aux = '';
    inventories.forEach((inventory) => {
      inventory.files.forEach((file) => {
        aux += `(${file},${inventory.id}),`;
      });
    });

    const result = aux.substring(0, aux.length - 1);
    return { invFiles: result };
  }
}
