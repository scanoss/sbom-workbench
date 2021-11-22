import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { Response } from './Response';
import { logicResultService } from './services/LogicResultService';
import { Project } from './workspace/Project';
import { NodeStatus } from './workspace/Tree/Tree/Node';
import { workspace } from './workspace/Workspace';

ipcMain.handle(IpcEvents.IGNORED_FILES, async (event, arg: number[]) => {
  const p = workspace.getOpenedProjects()[0];
  const data = await p.scans_db.files.ignored(arg);
  console.log(arg, 'ARG en ignored');

  logicResultService
    .getResultsByids(arg)
    .then((filesToUpdate) => {
      console.log(filesToUpdate, 'filesToUpdate');
      const paths = Object.keys(filesToUpdate);
      for (const filePath of paths) {
        p.getTree().getRootFolder().setStatus(filePath, NodeStatus.IGNORED);
      }
      p.updateTree();

      return true;
    })
    .catch((e) => {
      console.log(e);
      throw e;
    });

  if (data) return { status: 'ok', message: 'Files succesfully ignored', data };
  return { status: 'error', message: 'Files were not ignored', data };
});

ipcMain.handle(IpcEvents.UNIGNORED_FILES, async (event, arg: number[]) => {
  const p = workspace.getOpenedProjects()[0];
  const data = await p.scans_db.results.restore(arg);

  logicResultService
    .getResultsByids(arg)
    .then((filesToUpdate) => {
      const paths = Object.keys(filesToUpdate);
      for (const filePath of paths) {
        p.getTree().getRootFolder().setStatus(filePath, NodeStatus.PENDING);
      }

      p.updateTree();
      return true;
    })
    .catch((e) => {
      console.log(e);
      throw e;
    });

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
    status: 'fail',
    message: 'Files were not successfully retrieved',
  };
});

ipcMain.handle(IpcEvents.RESULTS_ADD_FILTERED_FILE, async (event, filePath: string) => {
  try {
    console.log('Add filtered file: ', filePath);
    const p: Project = workspace.getOpenedProjects()[0];
    //const node = p.getNodeFromPath(filePath);
    //node.action = 'scan';
    //node.className = 'match-info-result';
    const result = await p.scans_db.results.insertFiltered(filePath);
    //p.save();
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
    console.log('Force attach file: ', filePath);
    const p: Project = workspace.getOpenedProjects()[0];
    const node = p.getNodeFromPath(filePath);
    console.log(node);
    //node.action = 'scan';
    //node.className = 'match-info-result';
    //p.save();
    const result = await workspace.getOpenedProjects()[0].scans_db.results.updateResult(filePath);
    return Response.ok({
      message: 'Results updated succesfully',
      data: result,
    });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});
