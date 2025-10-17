import { IpcChannels } from '../ipc-channels';
import { BaseService } from './base.service';
import { SettingsFileInfo, ContextFiles, GroupSearchKeyword, IProject, License } from '../types';
import { GroupSearchKeywordDTO } from '@api/dto';

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

  public async importProject(projectZipPath: string, projectSourcePath?:string | null): Promise<IProject> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_IMPORT_PROJECT,
      projectZipPath,
      projectSourcePath,
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

  /**
   * @deprecated Use getSettingsFileInfo() instead.
   */
  public async contextFiles(scanRoot: string): Promise<ContextFiles> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_CONTEXT_FILES,
      scanRoot,
    );
    return this.response(response);
  }

  /** Workspace Group Search * */
  // GET
  public async getAllGroupSearchKeywords(): Promise<Array<GroupSearchKeyword>> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_GET_SEARCH_GROUP_KEYWORDS,
    );
    return this.response(response);
  }

  // POST
  public async addSearchGroups(groups: Array<GroupSearchKeywordDTO>): Promise<Array<GroupSearchKeyword>>{
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_POST_SEARCH_GROUP,
      groups,
    );
    return this.response(response);
  }

  // PUT
  public async updateSearchGroup(group: GroupSearchKeywordDTO): Promise<Array<GroupSearchKeyword>> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_PUT_SEARCH_GROUP,
      group,
    );
    return this.response(response);
  }

  // DELETE
  public async deleteSearchGroup(id: number): Promise<GroupSearchKeyword> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_DELETE_SEARCH_GROUP,
      id,
    );
    return this.response(response);
  }

  /**
   * @deprecated Use getConfigFileInfo() instead.
   */
  public async getScanossSettingsFilePath(scanRoot: string): Promise<string> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_SCANOSS_SETTING_FILE,
      scanRoot,
    );
    return this.response(response);
  }

  public async getSettingsFileInfo(scanRoot: string): Promise<SettingsFileInfo> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_SETTINGS_FILE_INFO,
      scanRoot,
    );
    return this.response(response);
  }
}

export const workspaceService = new WorkspaceService();
