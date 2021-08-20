import { IpcEvents } from '../ipc-events';
import { License } from './types';

const { ipcRenderer } = require('electron');

class LicenseService {

  public async get(args: Partial<License>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.LICENSE_GET, args);
    return response;
  }

  public async getAll(): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.LICENSE_GET_ALL);
    return response;
  }

  public async create(license: License): Promise<License> {
    const response = await ipcRenderer.invoke(IpcEvents.LICENSE_CREATE, license);
    return response;
  }
}

export const licenseService = new LicenseService();

