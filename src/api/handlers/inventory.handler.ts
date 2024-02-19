import api from '../api';
import log from 'electron-log';
import { IBatchInventory, Inventory } from '../types';
import { IpcChannels } from '../ipc-channels';
import { Batch } from '../../main/batch/Batch';
import { BatchFactory } from '../../main/batch/BatchFactory';
import { inventoryService } from '../../main/services/InventoryService';
import { treeService } from '../../main/services/TreeService';
import { NodeStatus } from '../../main/workspace/tree/Node';
import { workspace } from '../../main/workspace/Workspace';
import { modelProvider } from '../../main/services/ModelProvider';
import { Response } from '../Response';

api.handle(IpcChannels.INVENTORY_GET_ALL, async (_event, params: Partial<Inventory>) => {
  try {
    const inventories = await inventoryService.getAll(params);
    return Response.ok({ message: 'Inventory Get All', data: inventories });
  } catch (error: any) {
    log.error('[ INVENTORY GET ALL ]: ', error, params);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.INVENTORY_GET, async (_event, param: Partial<Inventory>) => {
  try {
    const inventory: Inventory = await inventoryService.get(param);
    return Response.ok({ message: 'Inventory Get', data: inventory });
  } catch (error: any) {
    log.error('[ INVENTORY GET ]: ', error, param);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.INVENTORY_CREATE, async (event, param: Inventory) => {
  try {
    const inventory = await inventoryService.create(param);
    treeService.updateTree(param.files, NodeStatus.IDENTIFIED).catch((e) => {
      console.log('Error updating tree: ', e);
    });
    return Response.ok({ message: 'Inventory Create', data: inventory });
  } catch (error: any) {
    log.error('[ INVENTORY CREATE ]: ', error, param);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.INVENTORY_ATTACH_FILE, async (_event, param: Partial<Inventory>) => {
  try {
    const success = await inventoryService.attach(param);
    return Response.ok({ message: 'Inventory Attach', data: success });
  } catch (error: any) {
    log.error('[ INVENTORY ATTACH ]: ', error, param);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.INVENTORY_DETACH_FILE, async (_event, param: Partial<Inventory>) => {
  try {
    const success: boolean = await inventoryService.detach(param);
    treeService.retoreStatus(param.files);
    return Response.ok({ message: 'Inventory detach', data: success });
  } catch (error: any) {
    log.error('[ INVENTORY DETACH ]: ', error, param);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.INVENTORY_DELETE, async (_event, param: Partial<Inventory>) => {
  try {
    const inventoryFiles = await inventoryService.get(param);
    const files = inventoryFiles.files.reduce((acc, file) => {
      acc.push(file.id);
      return acc;
    }, []);
    treeService.updateTree(files, NodeStatus.PENDING);
    const success = await modelProvider.model.inventory.delete(param);
    return Response.ok({ message: 'Inventory Delete', data: success });
  } catch (error: any) {
    log.error('[ INVENTORY DELETE ]: ', error, param);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.INVENTORY_FROM_COMPONENT, async (_event) => {
  try {
    const data = await modelProvider.model.inventory.getFromComponent();
    return Response.ok({ message: 'Inventories from component', data });
  } catch (error: any) {
    log.error('[ INVENTORY DELETE ]: ', error);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.INVENTORY_BATCH, async (_event, params: IBatchInventory) => {
  try {
    const factory = new BatchFactory();
    const bachAction: Batch = factory.create(params);
    const success = await bachAction.execute();
    return Response.ok({ message: 'Inventory batch', data: success });
  } catch (error: any) {
    log.error('[ INVENTORY BATCH ]: ', error, params);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.INVENTORY_ACCEPT_PRE_LOAD, async (_event, param: Partial<IBatchInventory>) => {
  try {
    const filter = workspace.getOpenedProjects()[0].getGlobalFilter();
    const inventories: Array<Partial<Inventory>> = await inventoryService.preLoadInventoriesAcceptAll(param, filter);
    return Response.ok({ message: 'Inventory accept preload', data: inventories });
  } catch (error: any) {
    log.error('[ INVENTORY ACCEPT PRELOAD ]: ', error, param);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.INVENTORY_UPDATE, async (_event, param: Inventory) => {
  try {
    const inventory = await inventoryService.update(param);
    return Response.ok({ message: 'Inventory accept preload', data: inventory });
  } catch (error: any) {
    log.error('[ INVENTORY UPDATE ]: ', error, param);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.INVENTORY_GET_ALL_BY_FILE, async (_event, path: string) => {
  try {
    const inventories = await inventoryService.getAllByFile(path);
    return Response.ok({ message: 'Inventory Get All by file', data: inventories });
  } catch (error: any) {
    log.error('[ INVENTORY GET ALL BY FILE]: ', error, path);
    return Response.fail({ message: error.message });
  }
});
