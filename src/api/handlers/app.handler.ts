import { dialog, ipcMain, Menu, app, BrowserWindow } from 'electron';
import { IAppInfo } from '../dto';
import { IpcChannels } from '../ipc-channels';
import packageJson from '../../../release/app/package.json';
import { workspace } from '../../main/workspace/Workspace';

ipcMain.handle(IpcChannels.DIALOG_SHOW_OPEN_DIALOG, async (event, options) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), options);
  return !canceled ? filePaths : null;
});

ipcMain.handle(IpcChannels.DIALOG_SHOW_SAVE_DIALOG, async (event, options) => {
  const { canceled, filePath } = await dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), options);
  return !canceled ? filePath : null;
});

ipcMain.on(IpcChannels.DIALOG_SHOW_ERROR_BOX, (event, title: string, content: string) => {
  dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
    type: 'error',
    title,
    message: content,
  });
});

ipcMain.on(IpcChannels.DIALOG_BUILD_CUSTOM_POPUP_MENU, (event, params: any) => {
  params.forEach((p) => {
    if (p.actionId)
      p.click = () => {
        event.sender.send(IpcChannels.CONTEXT_MENU_COMMAND, p.actionId);
      };
    if (p.submenu) {
      p.submenu.forEach((s) => {
        s.click = () => {
          event.sender.send(IpcChannels.CONTEXT_MENU_COMMAND, s.actionId);
        };
      });
    }
  });
  const menu = Menu.buildFromTemplate(params);
  menu.popup({ window: BrowserWindow.fromWebContents(event.sender) });
});

ipcMain.handle(IpcChannels.APP_GET_APP_INFO, async(event) => {
  const appInfo: IAppInfo = {
    version: app.isPackaged ? app.getVersion() : packageJson.version,
    name: app.getName(),
    appPath: app.getAppPath(),
    work_root: workspace.getMyPath(),
    platform: process.platform,
    arch: process.arch,
  };
  return appInfo;
});
