import { app } from 'electron';
import { userSettingService } from './UserSettingService';
import { fileExists } from '../../main/utils/utils';


class WorkspaceService {

  public async setCurrent(wsPath: string): Promise<void> {
    const workspaces = userSettingService.get().WORKSPACES;
    let workspaceIndex =  workspaces.findIndex((w)=> w.PATH === wsPath);

    // If workspace path not exists , set default workspace
    if (workspaceIndex < 0) throw new Error('Workspace not found');

    // Selected workspace path does not exists
    if (!await fileExists(userSettingService.get().WORKSPACES[workspaceIndex].PATH))
      throw new Error('Invalid workspace path');

    userSettingService.set({ DEFAULT_WORKSPACE_INDEX: workspaceIndex });
    await userSettingService.save();

    // Relaunch app
    app.relaunch();
    app.exit();
  }

}

export  const workspaceService = new WorkspaceService();
