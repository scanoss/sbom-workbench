import { Inventory, InventoryAction } from '../../api/types';
import { Accept } from './Accept';
import { Batch } from './Batch';
import { Identified } from './Identified';
import { Ignore } from './Ignore';
import { Restore } from './Restore';

export class BatchFactory {
  public create(action: InventoryAction, overWrite: boolean, folder: string, inventory: Partial<Inventory>): Batch {
    switch (action) {
      case InventoryAction.RESTORE:
        return new Restore(folder, overWrite);
      case InventoryAction.IDENTIFY:
        return new Identified(folder, overWrite, inventory);
      case InventoryAction.IGNORE:
        return new Ignore(folder, overWrite);
      case InventoryAction.ACCEPT:
        return new Accept(folder, overWrite);
      default:
        return null;
    }
  }
}
