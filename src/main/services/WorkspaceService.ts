import { app } from 'electron';
import { userSettingService } from './UserSettingService';

class WorkspaceService {

  public async setCurrent(wsPath: string): Promise<void> {
    const workspaces = userSettingService.get().WORKSPACES;
    let workspaceIndex =  workspaces.findIndex((w)=> w.PATH === wsPath);

    // If workspace path not exists , set default workspace
    if (workspaceIndex < 0) throw new Error('Workspace not found');

    userSettingService.set({ DEFAULT_WORKSPACE_INDEX: workspaceIndex });
    await userSettingService.save();

    // Relaunch app
    app.relaunch();
    app.exit();
  }

}

export  const workspaceService = new WorkspaceService();
