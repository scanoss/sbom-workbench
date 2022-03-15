import { ipcMain } from 'electron';
import { License } from '../types';
import { IpcEvents } from '../ipc-events';
import { licenseHelper } from '../../main/helpers/LicenseHelper';
import { Response } from '../Response';
import { workspace } from '../../main/workspace/Workspace';

ipcMain.handle(IpcEvents.LICENSE_GET_ALL, async (event) => {
  try {
    const license = await workspace.getOpenedProjects()[0].store.license.getAll();
    return { status: 'ok', message: 'Licenses successfully retrieved', data: license };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.LICENSE_GET, async (_event, data: Partial<License>) => {
  try {
    const license = await workspace.getOpenedProjects()[0].store.license.get(data);
    return { status: 'ok', message: 'Licenses successfully retrieved', data: license };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.LICENSE_CREATE, async (_event, newLicense: Partial<License>) => {
  try {
    newLicense.spdxid = licenseHelper.licenseNameToSPDXID(newLicense.name);
    const license: License = await workspace.getOpenedProjects()[0].store.license.create(newLicense);
    return Response.ok({ message: 'License created successfully', data: license });
  } catch (error: any) {
    console.log('Catch an error: ', error);
    return Response.fail({ message: error.message });
  }
});
