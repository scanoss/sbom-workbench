import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { Response } from './Response';
import { logicResultService } from './services/LogicResultService';
import { Project } from './workspace/Project';
import { NodeStatus } from './workspace/Tree/Tree/Node';
import { workspace } from './workspace/Workspace';

ipcMain.handle(IpcEvents.IGNORED_FILES, async (event, arg: number[]) => {
  const project = workspace.getOpenedProjects()[0];
  const data = await logicResultService.ignore(arg);

  project.sendToUI(IpcEvents.TREE_UPDATING, {});
  logicResultService
    .getResultsByids(arg, project)
    .then((filesToUpdate) => {
      const paths = Object.keys(filesToUpdate);
      for (const filePath of paths) {
        project.getTree().getRootFolder().setStatus(filePath, NodeStatus.IGNORED);
      }
      project.updateTree();

      return true;
    })
    .catch((e) => {
      console.log(e);
      throw e;
    });

  if (data) return { status: 'ok', message: 'Files succesfully ignored', data };
  return { status: 'error', message: 'Files were not ignored', data };
});

// TO DO REMOVE UNUSED SERVICE
ipcMain.handle(IpcEvents.UNIGNORED_FILES, async (event, arg: number[]) => {
  const project = workspace.getOpenedProjects()[0];
  const data = await project.scans_db.results.restore(arg);
  project.sendToUI(IpcEvents.TREE_UPDATING, {});
  logicResultService
    .getResultsByids(arg, project)
    .then((filesToUpdate) => {
      const paths = Object.keys(filesToUpdate);
      for (const filePath of paths) {
        project.getTree().getRootFolder().setStatus(filePath, NodeStatus.PENDING);
      }

      project.updateTree();
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
  const result = await logicResultService.getFromPath(arg);
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
