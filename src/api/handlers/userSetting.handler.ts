import { ipcMain } from 'electron';
import { Response } from '../Response';
import { IpcChannels } from '../ipc-channels';
import { IWorkspaceCfg } from '../types';
import { userSettingService } from '../../main/services/UserSettingService';

ipcMain.handle(IpcChannels.USER_SETTING_SET, async (event, conf: Partial<IWorkspaceCfg>) => {
  try {
    const defUrl: any = userSettingService.getDefault().APIS[0];
    conf.APIS.splice(0, 0, defUrl);
    conf.DEFAULT_API_INDEX += 1;
    const settings = userSettingService.set(conf);
    await userSettingService.save();
    return Response.ok({ message: 'Node from path retrieve succesfully', data: settings });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcChannels.USER_SETTING_GET, async (event) => {
  try {
    const settings: Partial<IWorkspaceCfg> = userSettingService.get();
    settings.DEFAULT_API_INDEX -= 1;
    settings.APIS.splice(0, 1);
    return Response.ok({ message: 'Node from path retrieve succesfully', data: settings });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});
