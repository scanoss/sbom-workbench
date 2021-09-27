import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { Project } from './workspace/Project';
import { workspace } from './workspace/workspace';


ipcMain.handle(IpcEvents.EXPORT_SPDX, async (event, path: string) => {
  let success: boolean;
  try {
    success = await workspace.getOpenedProjects()[0].scans_db.formats.spdx(`${path}`);
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
    success = await workspace.getOpenedProjects()[0].scans_db.formats.csv(`${path}`);
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
    success =  await workspace.getOpenedProjects()[0].scans_db.formats.wfp(`${path}`, `${workspace.getOpenedProjects()[0].getWorkRoot()}/winnowing.wfp`);
    if (success) {
      return { status: 'ok', message: 'WFP exported successfully', data: success };
    }
    return { status: 'ok', message: 'Unable to export WFP', data: success };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.EXPORT_RAW, async (event, path: string) => {
  let success: boolean;
  try {
    const p: Project = workspace.getOpenedProjects()[0];
    success =  await p.scans_db.formats.raw(`${path}`,p.getResults());
    if (success) {
      return { status: 'ok', message: 'RAW exported successfully', data: success };
    }
    return { status: 'ok', message: 'Unable to export RAW', data: success };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});
