import { ipcMain } from 'electron';
import { workspace } from '../workspace/Workspace';
import { Response } from '../Response';
import { IpcEvents } from '../../ipc-events';
import { IWorkspaceCfg } from '../../api/types';
import { userSetting } from '../UserSetting';


ipcMain.handle(IpcEvents.USER_SETTING_SET, async (event, conf: Partial<IWorkspaceCfg>) => {
  try {

// obtener elel defaultApi y agregar al inicio de la lista.
  // sumarle +1 al indice que nos pasa el front end
   const settings = userSetting.set(conf);
   await userSetting.save();
    return Response.ok({ message: 'Node from path retrieve succesfully', data: settings });
  } catch (e:any) {
    return Response.fail({ message: e.message });
  }
});


ipcMain.handle(IpcEvents.USER_SETTING_GET, async (event) => {
  try {
    const settings = userSetting.get();
    // eliminar la primer URL en la lista
    // restar -1 al indice
    return Response.ok({ message: 'Node from path retrieve succesfully', data: settings });
  } catch (e:any) {
    return Response.fail({ message: e.message });
  }
});
