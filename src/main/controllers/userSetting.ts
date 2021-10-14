import { ipcMain } from 'electron';
import { workspace } from '../workspace/Workspace';
import { Response } from '../Response';
import { IpcEvents } from '../../ipc-events';
import { IWorkspaceCfg } from '../../api/types';
import { userSetting } from '../UserSetting';

ipcMain.handle(IpcEvents.USER_SETTING_SET, async (event, conf: Partial<IWorkspaceCfg>) => {
  try {    
    const defUrl: any = userSetting.getDefault().APIS[0];
    conf.APIS.splice(0, 0, defUrl);
    conf.DEFAULT_API_INDEX += 1;
    const settings = userSetting.set(conf);
    await userSetting.save();
    return Response.ok({ message: 'Node from path retrieve succesfully', data: settings });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcEvents.USER_SETTING_GET, async (event) => {
  try {
    const settings: Partial<IWorkspaceCfg> = userSetting.get();
    settings.DEFAULT_API_INDEX -= 1;
    settings.APIS.splice(0, 1);
    return Response.ok({ message: 'Node from path retrieve succesfully', data: settings });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});
