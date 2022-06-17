import { IBatchInventory, Inventory, InventoryAction } from '../../api/types';
import { Accept } from './Accept';
import { Batch } from './Batch';
import { Identified } from './Identified';
import { Ignore } from './Ignore';
import { Restore } from './Restore';

export class BatchFactory {
  public create(param: IBatchInventory): Batch {
    switch (param.action) {
      case InventoryAction.RESTORE:
        return new Restore(param.data.path, param.overwrite);
      case InventoryAction.IDENTIFY:
        return new Identified(param.data.path, param.overwrite, param.data.inventory);
      case InventoryAction.IGNORE:
        return new Ignore(param.data.path, param.overwrite);
      case InventoryAction.ACCEPT:
        return new Accept(param.data.path, param.overwrite, param.data.inventories, param.data.notes);
      default:
        return null;
    }
  }
}
