import * as fs from 'fs';
import { ipcMain } from 'electron';
import { isBinaryFileSync } from 'isbinaryfile';
import { IpcEvents } from '../ipc-events';
import { FileType } from '../api/types';
import { workspace } from './workspace/Workspace';
import { isPseudoBinary } from './workspace/isPseudoBinary';

const path = require('path');

const allowExtension = new Set ([".json", ".htm", ".html", ".xml"]);

ipcMain.handle(IpcEvents.FILE_GET_CONTENT, async (event, filePath: string) => {
  const fileContent = { content: '' };
  try {
    // TODO: remove when isPsuedoBinary is fixed
    const ext = path.extname(filePath);
    let isBin = false;
    if (allowExtension.has(ext)) {
      isBin = false;
    } else {
      isBin = isPseudoBinary(filePath);
    }

    if (isBin) {
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
    console.log('Catch an error: ', e);
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
