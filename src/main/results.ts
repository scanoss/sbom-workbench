import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { Response } from './Response';
import { Project } from './workspace/Project';
import { workspace } from './workspace/Workspace';

ipcMain.handle(IpcEvents.IGNORED_FILES, async (event, arg: number[]) => {
  const data = await workspace.getOpenedProjects()[0].scans_db.files.ignored(arg);
  if (data) return { status: 'ok', message: 'Files succesfully ignored', data };
  return { status: 'error', message: 'Files were not ignored', data };
});

ipcMain.handle(IpcEvents.UNIGNORED_FILES, async (event, arg: number[]) => {
  const data = await workspace.getOpenedProjects()[0].scans_db.results.restore(arg);
  if (data) return { status: 'ok', message: 'Files succesfully unignored', data };
  return { status: 'error', message: 'Files were not ignored', data };
});

ipcMain.handle(IpcEvents.RESULTS_GET, async (event, arg: string) => {
  const result = await workspace.getOpenedProjects()[0].scans_db.results.getAll(arg);
  if (result)
    return {
      status: 'ok',
      message: 'Results succesfully retrieved',
      data: result,
    };
  return { status: 'error', message: 'Files were not successfully retrieved' };
});

ipcMain.handle(IpcEvents.RESULTS_GET_NO_MATCH, async (event, filePath: string) => {
  const result = await workspace.getOpenedProjects()[0].scans_db.results.getNoMatch(filePath);
  if (result)
    return {
      status: 'ok',
      message: 'Results succesfully retrieved',
      data: result,
    };
  return {
    status: 'error',
    message: 'Files were not successfully retrieved',
  };
});

ipcMain.handle(IpcEvents.RESULTS_ADD_FILTERED_FILE, async (event, filePath: string) => {
  try {
    const p: Project = workspace.getOpenedProjects()[0];
    const node = p.getNodeFromPath(filePath);
    node.action = 'scan';
    node.className = 'match-info-result';
    const result = await p.scans_db.results.insertFiltered(filePath);
    p.save();
    return Response.ok({
      message: 'Results succesfully retrieved',
      data: result,
    });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcEvents.RESULTS_FORCE_ATTACH, async (event, filePath: string) => {
  try {
    const result = await workspace.getOpenedProjects()[0].scans_db.results.updateResult(filePath);
    return Response.ok({
      message: 'Results updated succesfully',
      data: result,
    });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});
