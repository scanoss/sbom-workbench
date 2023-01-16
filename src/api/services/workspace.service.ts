import { NewGlobalComponentDTO, NewLicenseDTO } from '@api/dto';
import { IpcChannels } from '../ipc-channels';
import { BaseService } from './base.service';
import { GlobalComponent, IProject, License } from '../types';

class WorkspaceService extends BaseService {
  public async getAllProjects(): Promise<IProject[]> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_PROJECT_LIST
    );
    return this.response(response);
  }

  public async deleteProject(args): Promise<void> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_DELETE_PROJECT,
      args
    );
    return this.response(response);
  }

  public async getProjectDTO(): Promise<any> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.UTILS_GET_PROJECT_DTO
    );
    return this.response(response);
  }

  public async getAllLicenses(): Promise<Array<License>> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_GET_ALL_LICENSES
    );
    return this.response(response);
  }

  public async createLicense(newLicenseDTO: NewLicenseDTO): Promise<License> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_CREATE_LICENSE, newLicenseDTO
    );
    return this.response(response);
  }

  public async deleteLicense(id: number): Promise<License> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_DELETE_LICENSE, id);
    return this.response(response);
  }

  public async getAllComponents(): Promise<Array<GlobalComponent>> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_GET_ALL_COMPONENTS);
    return this.response(response);
  }

  public async createComponent(newComponentDTO: NewGlobalComponentDTO): Promise<GlobalComponent> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_CREATE_COMPONENT, newComponentDTO);
    return this.response(response);
  }

  public async deleteComponent(id: number): Promise<GlobalComponent> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_DELETE_COMPONENT, id);
    return this.response(response);
  }

  public async importProject(projectZipPath: string): Promise<IProject> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_IMPORT_PROJECT,
      projectZipPath
    );
    return this.response(response);
  }

  public async exportProject(
    pathToSave: string,
    projectPath: string
  ): Promise<void> {
    const response = await window.electron.ipcRenderer.invoke(
      IpcChannels.WORKSPACE_EXPORT_PROJECT,
      pathToSave,
      projectPath
    );
    return this.response(response);
  }
}
export const workspaceService = new WorkspaceService();

