import { ipcMain } from 'electron';
import { IFolderInventory, Inventory } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { Batch } from './batch/Batch';
import { BatchFactory } from './batch/BatchFactory';
import { FilterTrue } from './batch/Filter/FilterTrue';
import { utilHelper } from './helpers/UtilHelper';
import { logicInventoryService } from './services/LogicInventoryService';
import { logicResultService } from './services/LogicResultService';
import { logictTreeService } from './services/LogicTreeService';
import { NodeStatus } from './workspace/Tree/Tree/Node';
import { workspace } from './workspace/Workspace';

ipcMain.handle(IpcEvents.INVENTORY_GET_ALL, async (_event, invget: Partial<Inventory>) => {
  let inv: any;
  try {
    inv = await logicInventoryService.getAll(invget);
    return { status: 'ok', message: inv, data: inv };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_GET, async (_event, inv: Partial<Inventory>) => {
  try {
    const inventory: Inventory = await logicInventoryService.get(inv);
    return { status: 'ok', message: 'Inventory retrieve successfully', data: inventory };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_CREATE, async (_event, arg: Inventory) => {
  try {
    const p = workspace.getOpenedProjects()[0];
    const inv = await logicInventoryService.create(arg);
    p.sendToUI(IpcEvents.TREE_UPDATING, {});
    logicResultService
      .getResultsFromIDs(arg.files)
      .then((files: any) => {
        const paths = utilHelper.getArrayFromObjectFilter(files, 'path', new FilterTrue()) as Array<string>;
        paths.forEach((path) => {
          p.getTree().getRootFolder().setStatus(path, NodeStatus.IDENTIFIED);
        });
        p.updateTree();
        return true;
      })
      .catch((e) => {
        throw e;
      });
    return { status: 'ok', message: 'Inventory created', data: inv };
  } catch (e) {
    console.log('Catch an error on inventory: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_ATTACH_FILE, async (_event, arg: Partial<Inventory>) => {
  try {
    
    // const p = workspace.getOpenedProjects()[0];
   // const success = await p.scans_db.inventories.attachFileInventory(arg);
    const success  = await logicInventoryService.attach(arg);
    return { status: 'ok', message: 'File attached to inventory successfully', success };
  } catch (e) {
    console.log('Catch an error on inventory: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_DETACH_FILE, async (_event, inv: Partial<Inventory>) => {
  try {
    logicResultService
      .getResultsFromIDs(inv.files)
      .then((files: any) => {
        const paths = utilHelper.getArrayFromObjectFilter(files, 'path', new FilterTrue()) as Array<string>;
        logictTreeService.retoreStatus(paths);
        return true;
      })
      .catch((e) => {
        throw e;
      });
    const success: boolean = await logicInventoryService.detach(inv);

    return { status: 'ok', message: 'File detached to inventory successfully', success };
  } catch (e) {
    console.log('Catch an error on inventory: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_DELETE, async (_event, arg: Partial<Inventory>) => {
  try {
    const p = workspace.getOpenedProjects()[0];
    p.scans_db.inventories
      .getInventoryFiles(arg)
      .then((files: any) => {
        const paths = utilHelper.getArrayFromObjectFilter(files, 'path', new FilterTrue()) as Array<string>;
        logictTreeService.retoreStatus(paths);
        return true;
      })
      .catch((e) => {
        throw e;
      });
    const success = await p.scans_db.inventories.delete(arg);
    if (success) return { status: 'ok', message: 'Inventory deleted successfully', success };
    return { status: 'error', message: 'Inventory was not deleted successfully', success };
  } catch (e) {
    console.log('Catch an error on inventory: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_FROM_COMPONENT, async (_event) => {
  try {
    const data = await workspace.getOpenedProjects()[0].scans_db.inventories.getFromComponent();
    if (data) return { status: 'ok', message: 'Inventories from component', data };
    return { status: 'error', message: 'Inventory from component was not successfully retrieve', data };
  } catch (e) {
    console.log('Catch an error on inventory: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_FOLDER, async (_event, params: IFolderInventory) => {
  try {
    const factory = new BatchFactory();
    const bachAction: Batch = factory.create(params);
    const success = await bachAction.execute();
    if (success) return { status: 'ok', message: 'Inventory folder successfully', success };
    return { status: 'fail', message: 'Inventory folder error' };
  } catch (e) {
    console.log('Catch an error on inventory: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_ACCEPT_PRE_LOAD, async (_event, folder: string) => {
  try {
    const inventories: Array<Partial<Inventory>> = await logicInventoryService.preLoadInventoriesAcceptAll(folder);

    return { status: 'ok', message: 'Inventory folder successfully', inventories };
  } catch (e) {
    console.log('Catch an error on inventory: ', e);
    return { status: 'fail' };
  }
});
