import { LicenseDTO, NewLicenseDTO } from "@api/dto";
import { IpcEvents } from '../ipc-events';
import { BaseService } from './base.service';

const { ipcRenderer } = require('electron');

class LicenseService extends BaseService {
  public async get(id: number): Promise<LicenseDTO> {
    const response = await ipcRenderer.invoke(IpcEvents.LICENSE_GET, id);
    return this.response(response);
  }

  public async getAll(): Promise<Array<LicenseDTO>> {
    const response = await ipcRenderer.invoke(IpcEvents.LICENSE_GET_ALL);
    return this.response(response);
  }

  public async create(license: NewLicenseDTO): Promise<LicenseDTO> {
    const response = await ipcRenderer.invoke(IpcEvents.LICENSE_CREATE, license);
    return this.response(response);
  }
}

export const licenseService = new LicenseService();

