import api from '../api';
import { Response } from '../Response';
import { IpcChannels } from '../ipc-channels';
import { IWorkspaceCfg } from '../types';
import { userSettingService } from '../../main/services/UserSettingService';

api.handle(IpcChannels.USER_SETTING_SET, async (event, conf: Partial<IWorkspaceCfg>) => {
  try {
    const settings = userSettingService.set(conf);
    console.log("New Settings", JSON.stringify(settings, null, 2));
    await userSettingService.save();
    return Response.ok({ message: 'Node from path retrieve succesfully', data: settings });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});

api.handle(IpcChannels.USER_SETTING_GET, async (event) => {
  try {
    const settings: Partial<IWorkspaceCfg> = userSettingService.get();
    return Response.ok({ message: 'Node from path retrieve succesfully', data: settings });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});
