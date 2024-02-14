import { BrowserWindow, RelaunchOptions, app, dialog } from 'electron';
import i18next from 'i18next';
import { userSettingService } from './UserSettingService';

class WorkspaceService {
  public async setCurrent(wsPath: string): Promise<void> {
    const workspaces = userSettingService.get().WORKSPACES;
    const workspaceIndex = workspaces.findIndex((w) => w.PATH === wsPath);

    // If workspace path not exists , set default workspace
    if (workspaceIndex < 0) throw new Error('Workspace not found');

    userSettingService.set({ DEFAULT_WORKSPACE_INDEX: workspaceIndex });
    await userSettingService.save();

    const { response } = await dialog.showMessageBox(
      BrowserWindow.getFocusedWindow(),
      {
        buttons: [i18next.t('Button:RestartLater'), i18next.t('Button:RestartNow')],
        message: i18next.t('Dialog:YouNeedRestartQuestionWorkspace'),
      },
    );

    if (response === 1) {
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

export const workspaceService = new WorkspaceService();
