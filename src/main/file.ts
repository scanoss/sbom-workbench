import * as fs from 'fs';
import { ipcMain } from 'electron';
import { isBinaryFileSync } from 'isbinaryfile';
import { IpcEvents } from '../ipc-events';

ipcMain.handle(IpcEvents.FILE_GET_CONTENT, async (event, filePath: string) => {
  const fileContent = { content: '' };
  try {
    const isBin = isBinaryFileSync(filePath);

    if (isBin) {
      fileContent.content = `Can not show content of binary file ${filePath} (yet ;-) )`;
    } else {
      const file = fs.readFileSync(filePath).toString();
      fileContent.content = file;
    }
    return { status: 'ok', message: 'File content retrieved', data: fileContent };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});
