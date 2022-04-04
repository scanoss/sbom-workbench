import { IpcEvents } from '../ipc-events';
import { BaseService } from './base.service';
import { Dependency } from '../types';
import { NewDependencyDTO } from '../dto';

const { ipcRenderer } = require('electron');

class DepencyService extends BaseService {
  public async getAll(params: any): Promise<Array<Dependency>> {
    const response = await ipcRenderer.invoke(IpcEvents.DEPENDENCY_GET_ALL, params);
    return this.response(response);
  }

  public async accept(params: NewDependencyDTO): Promise<Dependency> {
    console.log('accept params: ', params);
    const response = await ipcRenderer.invoke(IpcEvents.DEPENDENCY_ACCEPT, params);
    return this.response(response);
  }

  public async restore(dependencyId: number): Promise<Dependency> {
    const response = await ipcRenderer.invoke(IpcEvents.DEPENDENCY_RESTORE, dependencyId);
    return this.response(response);
  }

  public async acceptAll(dependencies: Array<Dependency>): Promise<Array<Dependency>> {
    const response = await ipcRenderer.invoke(IpcEvents.DEPENDENCY_ACCEPT_ALL, dependencies);
    return this.response(response);
  }

  public async reject(dependencyId: number): Promise<Dependency> {
    const response = await ipcRenderer.invoke(IpcEvents.DEPENDENCY_REJECT, dependencyId);
    return this.response(response);
  }
}
export const dependencyService = new DepencyService();
