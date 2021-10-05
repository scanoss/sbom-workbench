import { ipcMain } from 'electron';
import { License } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { Response } from './Response';
import { workspace } from './workspace/Workspace';

ipcMain.handle(IpcEvents.LICENSE_GET_ALL, async (event) => {
  try {
    const license = await workspace.getOpenedProjects()[0].scans_db.licenses.getAll();
    return { status: 'ok', message: 'Licenses successfully retrieved', data: license };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.LICENSE_GET, async (_event, data: Partial<License>) => {
  try {
    const license = await workspace.getOpenedProjects()[0].scans_db.licenses.get(data);
    return { status: 'ok', message: 'Licenses successfully retrieved', data: license };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.LICENSE_CREATE, async (_event, newLicense: License) => {
  let license: License;
  try {
    license = await workspace.getOpenedProjects()[0].scans_db.licenses.create(newLicense);
    return Response.ok({ message: 'License created successfully', data: license });
  } catch (error: any) {
    console.log('Catch an error: ', error);
    return Response.fail({ message: error.message });
  }
});
