import { InventoryAction } from '../../api/types';
import { Bach } from './Bach';
import { Restore } from './Restore';

export class BachFactory {
  public create(action: InventoryAction, overWrite: boolean, folder: string): Bach {
    switch (action) {
      case InventoryAction.RESTORE:
        return new Restore(folder, overWrite);
      default:
        return null;
    }
  }
}
