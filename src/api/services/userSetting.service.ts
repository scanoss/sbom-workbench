import { IpcEvents } from '../ipc-events';
import { IWorkspaceCfg } from '../types';
import { BaseService } from './base.service';



class UserSettingService extends BaseService {
  public async set(setting): Promise<IWorkspaceCfg> {
    const response = await window.electron.ipcRenderer.invoke(IpcEvents.USER_SETTING_SET, setting);
    return this.response(response);
  }

  public async get(): Promise<IWorkspaceCfg> {
    const response = await window.electron.ipcRenderer.invoke(IpcEvents.USER_SETTING_GET);
    return this.response(response);
  }
}

export const userSettingService = new UserSettingService();
