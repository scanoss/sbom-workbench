import { ipcMain } from 'electron';
import { workspace } from '../workspace/Workspace';
import { Response } from '../Response';
import { IpcEvents } from '../../ipc-events';
import { IWorkspaceCfg } from '../../api/types';
import { userSetting } from '../UserSetting';


ipcMain.handle(IpcEvents.USER_SETTING_SET, async (event, conf: Partial<IWorkspaceCfg>) => {
  try {
    const defUrl: string = userSetting.getDefault().AVAILABLE_URL_API[0];  
    conf.AVAILABLE_URL_API.splice(0,0,defUrl);
    conf.DEFAULT_URL_API += 1;   
    const settings = userSetting.set(conf);
    await userSetting.save();
    return Response.ok({ message: 'Node from path retrieve succesfully', data: settings });
  } catch (e:any) {
    return Response.fail({ message: e.message });
  }
});


ipcMain.handle(IpcEvents.USER_SETTING_GET, async (event) => {
  try {
    const settings:Partial<IWorkspaceCfg> = userSetting.get();
    settings.DEFAULT_URL_API -= 1;
    settings.AVAILABLE_URL_API.splice(0,1);
    return Response.ok({ message: 'Node from path retrieve succesfully', data: settings });
  } catch (e:any) {
    return Response.fail({ message: e.message });
  }
});
