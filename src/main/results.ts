import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { defaultProject } from './workspace/ProjectTree';

ipcMain.handle(IpcEvents.IGNORED_FILES, async (event, arg: string[]) => {
  const data = await defaultProject.scans_db.files.ignored(arg);
  if (data) return { status: 'ok', message: 'Files succesfully ignored', data };
  return { status: 'error', message: 'Files were not ignored', data };
});


ipcMain.handle(IpcEvents.UNIGNORED_FILES, async (event, arg: string[]) => {
  const data = await defaultProject.scans_db.files.unignored(arg);
  if (data) return { status: 'ok', message: 'Files succesfully unignored', data };
  return { status: 'error', message: 'Files were not ignored', data };
});

ipcMain.handle(IpcEvents.RESULTS_GET, async (event, arg: string) => {
  const result = await defaultProject.scans_db.results.get(arg);
  if (result) return { status: 'ok', message: 'Results succesfully retrieved', data: result };
  return { status: 'error', message: 'Files were not successfully retrieved' };
});

