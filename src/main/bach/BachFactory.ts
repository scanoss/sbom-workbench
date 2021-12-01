import { Inventory, InventoryAction } from '../../api/types';

import { Bach } from './Bach';
import { Identified } from './Identified';
import { Restore } from './Restore';

export class BachFactory {
  public create(action: InventoryAction, overWrite: boolean, folder: string, inventory: Partial<Inventory>): Bach {
    switch (action) {
      case InventoryAction.RESTORE:
        return new Restore(folder, overWrite);
      case InventoryAction.IDENTIFY:
        return new Identified(folder, overWrite, inventory);
      default:
        return null;
    }
  }
}
