import { Inventory } from '../../../api/types';
import { Accept } from '../../batch/Accept';
import { inventoryService } from '../../services/InventoryService';
import { workspace } from '../../workspace/Workspace';
import { ITask } from '../Task';
import { AutoAcceptDTO } from './AutoAcceptDTO';

export class AutoAccept implements ITask<AutoAcceptDTO> {
  public async run(): Promise<AutoAcceptDTO> {
    const filter = workspace.getOpenedProjects()[0].getGlobalFilter();
    const inventories = await inventoryService.preLoadInventoriesAcceptAll({ folder: '/' }, filter);
    const validInventories = inventories.filter((el) => el.spdxid) as Array<Inventory>;
    const totalInventories = inventories.length;
    const componentsAccepted = validInventories.length;
    const componentsRejected = totalInventories - componentsAccepted;
    const acceptAll = new Accept('/', false, validInventories, 'AutoAccept');
    await acceptAll.execute();
    const autoAcceptDTO: AutoAcceptDTO = {
      success: true,
      message: 'Auto Accept success',
      componentsAccepted,
      componentsRejected,
    };

    return autoAcceptDTO;
  }
}
