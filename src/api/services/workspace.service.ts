import { IpcChannels } from '../ipc-channels';
import { BaseService } from './base.service';
import { IProject, License } from '../types';

class WorkspaceService extends BaseService {
  public async getAllProjects(): Promise<IProject[]> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_PROJECT_LIST,
    );
    return this.response(response);
  }

  public async deleteProject(args): Promise<void> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_DELETE_PROJECT,
      args,
    );
    return this.response(response);
  }

  public async getProjectDTO(): Promise<any> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.UTILS_GET_PROJECT_DTO,
    );
    return this.response(response);
  }

  public async getLicenses(): Promise<Array<License>> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.GET_LICENSES,
    );
    return this.response(response);
  }

  public async importProject(projectZipPath: string): Promise<IProject> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_IMPORT_PROJECT,
      projectZipPath,
    );
    return this.response(response);
  }

  public async exportProject(
    pathToSave: string,
    projectPath: string,
  ): Promise<void> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_EXPORT_PROJECT,
      pathToSave,
      projectPath,
    );
    return this.response(response);
  }

  public async setCurrent(wsPath: string) {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_SET_CURRENT,
      wsPath,
    );
    return this.response(response);
  }

  public async contextFiles(scanRoot: string) {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_CONTEXT_FILES,
      scanRoot,
    );
    return this.response(response);
  }
}

export const workspaceService = new WorkspaceService();
