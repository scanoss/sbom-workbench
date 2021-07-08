import { IpcEvents } from '../ipc-events';
import { License } from './types';

const { ipcRenderer } = require('electron');

class LicenseService {
  public async get(lic: any): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.LICENSE_GET, lic);
    return response;
  }

  public async create(license: License): Promise<any> {
    const response = await ipcRenderer.invoke(
      IpcEvents.LICENSE_CREATE,
      license
    );
    return response;
  }
}

export const licenseService = new LicenseService();
