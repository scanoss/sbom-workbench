import * as fs from 'fs';
import { ipcMain } from 'electron';
import { isBinaryFileSync } from 'isbinaryfile';
import { IpcEvents } from '../ipc-events';
import { FileType } from '../api/types';
import { workspace } from './workspace/Workspace';

const path = require('path');

function isAllowed(filePath: string) {
  const skip = new Set(['.exe', '.zip', '.tar', '.tgz', '.gz', '.7z', '.rar', '.jar', '.war', '.ear', '.class', '.pyc',
    '.o', '.a', '.so', '.obj', '.dll', '.lib', '.out', '.app', '.bin', '.lst', '.dat']);

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
    data = await workspace.getOpenedProjects()[0].scans_db.files.get(arg);
    if (data) return { status: 'ok', message: 'Get file', data };
    return { status: 'ok', message: 'Get file', data };
  } catch (error) {
    return { status: 'error', message: 'Get file were not successfully retrieve', data };
  }
});
