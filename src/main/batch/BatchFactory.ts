import { IFolderInventory, Inventory, InventoryAction } from '../../api/types';
import { Accept } from './Accept';
import { Batch } from './Batch';
import { Identified } from './Identified';
import { Ignore } from './Ignore';
import { Restore } from './Restore';

export class BatchFactory {
  public create(param: IFolderInventory): Batch {
    switch (param.action) {
      case InventoryAction.RESTORE:
        return new Restore(param.folder, param.overwrite);
      case InventoryAction.IDENTIFY:
        return new Identified(param.folder, param.overwrite, param.data as Partial<Inventory>);
      case InventoryAction.IGNORE:
        return new Ignore(param.folder, param.overwrite);
      case InventoryAction.ACCEPT:
        return new Accept(param.folder, param.overwrite, param.data as Partial<Array<Inventory>>, param.notes);
      default:
        return null;
    }
  }
}
