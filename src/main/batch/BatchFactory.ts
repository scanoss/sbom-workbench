import { IBatchInventory, InventoryAction } from '../../api/types';
import { Accept } from './Accept';
import { Batch } from './Batch';
import { Identified } from './Identified';
import { Ignore } from './Ignore';
import { Restore } from './Restore';

export class BatchFactory {
  public create(param: IBatchInventory): Batch {
    switch (param.action) {
      case InventoryAction.RESTORE:
        return new Restore(param);
      case InventoryAction.IDENTIFY:
        return new Identified(param, param.data.inventory);
      case InventoryAction.IGNORE:
        return new Ignore(param);
      case InventoryAction.ACCEPT:
        return new Accept(param, param.data.inventories, param.data.notes);
      default:
        return null;
    }
  }
}
