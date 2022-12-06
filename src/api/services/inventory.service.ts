import { IpcChannels } from '../ipc-channels';
import { BaseService } from './base.service';
import { IBatchInventory, Inventory } from '../types';

class InventoryService extends BaseService {
  public async getAll(args: Partial<Inventory>): Promise<any> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.INVENTORY_GET_ALL, args);
    return this.response(response);
  }

  public async get(args: Partial<Inventory>): Promise<any> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.INVENTORY_GET, args);
    return this.response(response);
  }

  public async create(inventory: Inventory): Promise<Inventory> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.INVENTORY_CREATE, inventory);
    return this.response(response);
  }

  public async update(inventory: Inventory): Promise<Inventory> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.INVENTORY_UPDATE, inventory);
    return this.response(response);
  }

  public async attach(inventory: Partial<Inventory>): Promise<any> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.INVENTORY_ATTACH_FILE, inventory);
    return this.response(response);
  }

  public async detach(inventory: Partial<Inventory>): Promise<any> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.INVENTORY_DETACH_FILE, inventory);
    return this.response(response);
  }

  public async delete(inventory: Partial<Inventory>): Promise<any> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.INVENTORY_DELETE, inventory);
    return this.response(response);
  }

  public async getFromComponent(): Promise<any[]> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.INVENTORY_FROM_COMPONENT);
    return this.response(response);
  }

  public async batch(args: IBatchInventory): Promise<any[]> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.INVENTORY_BATCH, args);
    return this.response(response);
  }

  public async acceptAllPreLoadInventory(data: Partial<IBatchInventory>): Promise<Partial<Array<Inventory>>> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.INVENTORY_ACCEPT_PRE_LOAD, data);
    return this.response(response);
  }
}

export const inventoryService = new InventoryService();

document.is = inventoryService;
