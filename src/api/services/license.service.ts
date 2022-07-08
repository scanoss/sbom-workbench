import { LicenseDTO, NewLicenseDTO } from "@api/dto";
import { IpcChannels } from '../ipc-channels';
import { BaseService } from './base.service';



class LicenseService extends BaseService {
  public async get(id: number): Promise<LicenseDTO> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.LICENSE_GET, id);
    return this.response(response);
  }

  public async getAll(): Promise<Array<LicenseDTO>> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.LICENSE_GET_ALL);
    return this.response(response);
  }

  public async create(license: NewLicenseDTO): Promise<LicenseDTO> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.LICENSE_CREATE, license);
    return this.response(response);
  }
}

export const licenseService = new LicenseService();

