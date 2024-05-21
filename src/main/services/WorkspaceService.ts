import { BrowserWindow, RelaunchOptions, app } from 'electron';
import { userSettingService } from './UserSettingService';
import { getContextFiles } from './utils/workspace';

class WorkspaceService {
  public async setCurrent(wsPath: string): Promise<void> {
    const workspaces = userSettingService.get().WORKSPACES;
    const workspaceIndex = workspaces.findIndex((w) => w.PATH === wsPath);

    // If workspace path not exists , set default workspace
    if (workspaceIndex < 0) throw new Error('Workspace not found');

    userSettingService.set({ DEFAULT_WORKSPACE_INDEX: workspaceIndex });
    await userSettingService.save();

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

  public async contextFiles(scanRoot: string) {
    return getContextFiles(scanRoot);
  }
}

export const workspaceService = new WorkspaceService();
