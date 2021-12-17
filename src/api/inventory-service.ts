import { IpcEvents } from '../ipc-events';
import { BaseService } from './base-service';
import { IFolderInventory, Inventory } from './types';

const { ipcRenderer } = require('electron');

class InventoryService extends BaseService {
  public async getAll(args: Partial<Inventory>): Promise<any> {  
    const response = await ipcRenderer.invoke(IpcEvents.INVENTORY_GET_ALL, args);
    return this.response(response);
  }

  public async get(args: Partial<Inventory>): Promise<any> {   
    const response = await ipcRenderer.invoke(IpcEvents.INVENTORY_GET, args);
    return this.response(response);
  }

  public async create(inventory: Inventory): Promise<Inventory> {
    console.log('Create inventory: ', inventory);
    const response = await ipcRenderer.invoke(IpcEvents.INVENTORY_CREATE, inventory);
    return this.response(response);
  }

  public async attach(inventory: Partial<Inventory>): Promise<any> {
    console.log('Attach inventory: ', inventory);
    const response = await ipcRenderer.invoke(IpcEvents.INVENTORY_ATTACH_FILE, inventory);
    return this.response(response);
  }

  public async detach(inventory: Partial<Inventory>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.INVENTORY_DETACH_FILE, inventory);
    return this.response(response);
  }

  public async delete(inventory: Partial<Inventory>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.INVENTORY_DELETE, inventory);
    return this.response(response);
  }

  public async getFromComponent(): Promise<any[]> {
    const response = await ipcRenderer.invoke(IpcEvents.INVENTORY_FROM_COMPONENT);
    return this.response(response);
  }

  public async folder(args: IFolderInventory): Promise<any[]> {
    const response = await ipcRenderer.invoke(IpcEvents.INVENTORY_FOLDER, args);
    return this.response(response);
  }

  public async acceptAllPreLoadInventory(folder: string): Promise<Partial<Array<Inventory>>> {
    const response = await ipcRenderer.invoke(IpcEvents.INVENTORY_ACCEPT_PRE_LOAD, folder);
    console.log('acceptAllPreLoadInventory: ', response);
    return this.response(response);
  }
}

export const inventoryService = new InventoryService();


document.inv = inventoryService;