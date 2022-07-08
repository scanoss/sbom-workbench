import { IpcChannels } from '../ipc-channels';
import { BaseService } from './base.service';
import { Dependency } from '../types';
import { AcceptAllDependeciesDTO, NewDependencyDTO, RejectAllDependeciesDTO, RestoreAllDependenciesDTO } from '../dto';

class DepencyService extends BaseService {
  public async getAll(params: any): Promise<Array<Dependency>> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.DEPENDENCY_GET_ALL, params);
    return this.response(response);
  }

  public async accept(params: NewDependencyDTO): Promise<Dependency> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.DEPENDENCY_ACCEPT, params);
    return this.response(response);
  }

  public async restore(dependencyId: number): Promise<Dependency> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.DEPENDENCY_RESTORE, dependencyId);
    return this.response(response);
  }

  public async restoreAll(params: RestoreAllDependenciesDTO): Promise<Array<Dependency>> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.DEPENDENCY_RESTORE_ALL, params);
    return this.response(response);
  }

  public async acceptAll(params: AcceptAllDependeciesDTO): Promise<Array<Dependency>> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.DEPENDENCY_ACCEPT_ALL, params);
    return this.response(response);
  }

  public async reject(dependencyId: number): Promise<Dependency> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.DEPENDENCY_REJECT, dependencyId);
    return this.response(response);
  }

  public async rejectAll(params: RejectAllDependeciesDTO): Promise<Array<Dependency>> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.DEPENDENCY_REJECT_ALL, params);
    return this.response(response);
  }
}
export const dependencyService = new DepencyService();
