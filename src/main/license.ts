import { ipcMain } from 'electron';
import { License } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { defaultWorkspace } from './workspace/workspace';

ipcMain.handle(IpcEvents.LICENSE_GET, async (_event, licToGet: License) => {
  let license: any;
  try {
    license = await defaultWorkspace.scans_db.licenses.get(licToGet);
  } catch (e) {
    console.log('Catch an error: ', e);
  }
  return { status: 'ok', message: license };
});

ipcMain.handle(IpcEvents.LICENSE_CREATE, async (_event, arg: License) => {
  let created: any;
  try {
    created = await defaultWorkspace.scans_db.licenses.create(arg);
  } catch (e) {
    console.log('Catch an error: ', e);
  }
  console.log('License was created ');
  console.log(arg);
  return { status: 'ok', message: created };
});
