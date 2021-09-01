import { IpcEvents } from '../ipc-events';
import { License } from './types';
import { BaseService } from './base-service';

const { ipcRenderer } = require('electron');

class LicenseService extends BaseService {
  public async get(args: Partial<License>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.LICENSE_GET, args);
    return response;
  }

  public async getAll(): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.LICENSE_GET_ALL);
    return response;
  }

  public async create(license: Partial<License>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.LICENSE_CREATE, license);
    return this.response(response);  
  }
}

export const licenseService = new LicenseService();

