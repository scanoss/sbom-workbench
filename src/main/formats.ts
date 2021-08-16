import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { defaultProject } from './workspace/ProjectTree';


ipcMain.handle(IpcEvents.EXPORT_SPDX, async (event, path: string) => {
  let success: boolean;
  try {
    success = await defaultProject.scans_db.formats.spdx(`${path}`);
    // success = await defaultProject.scans_db.formats.csv(`${path}/${defaultProject.project_name}`);
    if (success) {
      return { status: 'ok', message: 'SPDX exported successfully', data: success };
    }
    return { status: 'ok', message: 'Unable to export SPDX', data: success };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.EXPORT_CSV, async (event, path: string) => {
  let success: boolean;
  try {
    success = await defaultProject.scans_db.formats.csv(`${path}`);
    if (success) {
      return { status: 'ok', message: 'CSV exported successfully', data: success };
    }
    return { status: 'ok', message: 'Unable to export CSV', data: success };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});



ipcMain.handle(IpcEvents.EXPORT_WFP, async (event, path: string) => {
  let success: boolean;
  try {
    success = await defaultProject.scans_db.formats.csv(`${path}`);
    if (success) {
      return { status: 'ok', message: 'CSV exported successfully', data: success };
    }
    return { status: 'ok', message: 'Unable to export CSV', data: success };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});
