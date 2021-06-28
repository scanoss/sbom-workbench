import { IpcEvents } from '../ipc-events';
import { Inventory } from './types';

const { ipcRenderer } = require('electron');

class InventoryService {
  public async get(id: number): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.INVENTORY_GET, id);
    return response;
  }

  public async create(inventory: Inventory): Promise<any> {
    const response = await ipcRenderer.invoke(
      IpcEvents.INVENTORY_CREATE,
      inventory
    );
    return response;
  }
}

export const inventoryService = new InventoryService();
