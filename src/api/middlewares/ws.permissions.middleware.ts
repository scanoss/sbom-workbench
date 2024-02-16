/* eslint-disable no-bitwise */
import { BrowserWindow, RelaunchOptions, app, dialog } from 'electron';
import fs from 'fs';
import os from 'os';
import { userSettingService } from '../../main/services/UserSettingService';
import { workspace } from '../../main/workspace/Workspace';
import { modelProvider } from '../../main/services/ModelProvider';

export async function wsPermissionsMiddleware() {
  try {
    await fs.promises.access(workspace.getMyPath(), fs.constants.W_OK | fs.constants.X_OK | fs.constants.R_OK); // Project folder does have write permissions
  } catch (e) {
    await restartApp();
  }
}

let nDialog = 0;
async function restartApp() {
  if (nDialog <= 0) {
    nDialog++;

    const { username } = os.userInfo();
    const { response } = await dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
      buttons: ['Accept'],
      message: `User '${username}' does not have access permissions on workspace ${workspace.getMyPath()}\n\nThe app will restart and load the default workspace.`,
    });

    if (response === 0) {
      await modelProvider.workspace.destroy();
      await modelProvider.model.destroy();
      // Set default workspace on accept
      userSettingService.set({ DEFAULT_WORKSPACE_INDEX: 0 });
      await userSettingService.save();

      // Restart app
      const options: RelaunchOptions = {
        args: process.argv.slice(1).concat(['--relaunch']),
        execPath: process.execPath,
      };
      if (process.env.APPIMAGE) {
        options.execPath = process.env.APPIMAGE;
        options.args.unshift('--appimage-extract-and-run');
      }
      app.relaunch(options);
      app.exit(0);
    }
  }
}
