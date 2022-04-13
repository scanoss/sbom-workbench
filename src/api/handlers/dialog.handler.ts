/**
 * Handler to manage system dialogs
 *
 * TODO: We should use a contextBridge to manage this connection?
 * See:  https://medium.com/developer-rants/opening-system-dialogs-in-electron-from-the-renderer-6daf49782fd8
 */
import { dialog, ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';

const window = require('electron').BrowserWindow;

ipcMain.handle(IpcEvents.DIALOG_SHOW_OPEN_DIALOG, async (event, options) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(window.getFocusedWindow(), options);
  return !canceled ? filePaths : null;
});

ipcMain.handle(IpcEvents.DIALOG_SHOW_SAVE_DIALOG, async (event, options) => {
  const { canceled, filePath } = await dialog.showSaveDialog(window.getFocusedWindow(), options);
  return !canceled ? filePath : null;
});

ipcMain.on(IpcEvents.DIALOG_SHOW_ERROR_BOX, (event, title: string, content: string) => {
  dialog.showMessageBox(window.getFocusedWindow(), {
    type: 'error',
    title,
    message: content,
  });
});
