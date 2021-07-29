import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { defaultProject } from './workspace/ProjectTree';


ipcMain.handle(IpcEvents.EXPORT_SPDX, async (event, path: string) => {
  let success: boolean;
  try {    
    success = await defaultProject.scans_db.formats.spdx(`${path}/${defaultProject.project_name}`);
    if (success) {
      return { status: 'ok', message: 'SPDX export successfully', data: success };
    }
    return { status: 'ok', message: 'Unable to export SPDX', data: success };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});
