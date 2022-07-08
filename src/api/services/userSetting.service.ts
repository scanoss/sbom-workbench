import { IpcChannels } from '../ipc-channels';
import { IWorkspaceCfg } from '../types';
import { BaseService } from './base.service';



class UserSettingService extends BaseService {
  public async set(setting): Promise<IWorkspaceCfg> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.USER_SETTING_SET, setting);
    return this.response(response);
  }

  public async get(): Promise<IWorkspaceCfg> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.USER_SETTING_GET);
    return this.response(response);
  }
}

export const userSettingService = new UserSettingService();
