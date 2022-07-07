import * as fs from 'fs';
import { ipcMain } from 'electron';
import { isBinaryFileSync } from 'isbinaryfile';
import { GetFileDTO } from "@api/dto";
import { IpcEvents } from '../ipc-events';
import { FileType } from '../types';
import { workspace } from '../../main/workspace/Workspace';
import { NodeStatus } from '../../main/workspace/tree/Node';
import { utilHelper } from '../../main/helpers/UtilHelper';
import { FilterTrue } from '../../main/batch/Filter/FilterTrue';
import { resultService } from '../../main/services/ResultService';
import { fileService } from '../../main/services/FileService';
import { Response } from '../Response';

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

ipcMain.handle(IpcEvents.FILE_GET_CONTENT, async (_event, filePath: string) => {
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

ipcMain.handle(IpcEvents.FILE_GET, async (_event, params: GetFileDTO) => {
  let data;
  try {
    data = await fileService.get(params);
    return Response.ok({ message: 'File retrieve successfully', data });
  } catch (error: any) {
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.IGNORED_FILES, async (_event, arg: number[]) => {
  const project = workspace.getOpenedProjects()[0];
  const data = await fileService.ignore(arg);
  project.getTree().sendToUI(IpcEvents.TREE_UPDATING, {});
  resultService
    .getResultsFromIDs(arg)
    .then((filesToUpdate: any) => {
      const paths = utilHelper.getArrayFromObjectFilter(filesToUpdate, 'path', new FilterTrue()) as Array<string>;
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
