import * as fs from 'fs';
import { ipcMain } from 'electron';
import { isBinaryFileSync } from 'isbinaryfile';
import { IpcEvents } from '../ipc-events';
import { File, FileType } from '../api/types';
import { workspace } from './workspace/Workspace';
import { logicResultService } from './services/LogicResultService';
import { NodeStatus } from './workspace/Tree/Tree/Node';

const path = require('path');

function isAllowed(filePath: string) {
  const skip = new Set([
    '.exe',
    '.zip',
    '.tar',
    '.tgz',
    '.gz',
    '.7z',
    '.rar',
    '.jar',
    '.war',
    '.ear',
    '.class',
    '.pyc',
    '.o',
    '.a',
    '.so',
    '.obj',
    '.dll',
    '.lib',
    '.out',
    '.app',
    '.bin',
    '.lst',
    '.dat',
  ]);

  // Filter by extension
  const ext = path.extname(filePath);
  if (skip.has(ext)) {
    return false;
  }

  // if binary
  if (isBinaryFileSync(filePath)) {
    return false;
  }

  return true;
}

ipcMain.handle(IpcEvents.FILE_GET_CONTENT, async (event, filePath: string) => {
  const fileContent = { content: null };
  try {
    if (!isAllowed(filePath)) {
      fileContent.content = FileType.BINARY;
    } else {
      const file = fs.readFileSync(filePath).toString();
      fileContent.content = file;
    }

    return {
      status: 'ok',
      message: 'File content retrieved',
      data: fileContent,
    };
  } catch (e) {
    console.log('Error on file get content: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.FILE_GET, async (_event, arg: Partial<File>) => {
  let data;
  try {
    data = await workspace.getOpenedProjects()[0].store.file.get(arg); 
    return { status: 'ok', message: 'Get file', data };
  } catch (error) {
    return { status: 'error', message: 'Get file were not successfully retrieve', data };
  }
});

ipcMain.handle(IpcEvents.FILE_GET_ID_FROM_PATH, async (_event, arg: string) => {
  try {
    const data = await workspace.getOpenedProjects()[0].store.file.getIdFromPath(arg);
    return { status: 'ok', message: 'Get id from file path', data };
  } catch (error) {
    return { status: 'error', message: 'Get file were not successfully retrieve' };
  }
});

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
