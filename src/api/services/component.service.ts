import { IpcEvents } from '../ipc-events';
import {
  Component,
  License,
  ComponentGroup,
  NewComponentDTO,
  IWorkbenchFilter,
  IWorkbenchFilterParams,
} from '../types';
import { BaseService } from './base.service';

const { ipcRenderer } = require('electron');

class ComponentService extends BaseService {
  public async create(component: Partial<NewComponentDTO>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_CREATE, component);
    return this.response(response);
  }

  public async delete(component: Partial<Component>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_DELETE, component);
    return response;
  }

  public async attachLicense(component: Partial<Component>, license: Partial<License>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_ATTACH_LICENSE, component, license);
    return response;
  }

  public async detachLicense(component: Component, license: License): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_DETACH_LICENSE, component, license);
    return response;
  }

  public async getFiles(component: Partial<Component>, params: IWorkbenchFilter = null): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_GET_FILES, component, params);
    return response;
  }

  public async getAll(params?: IWorkbenchFilterParams): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_GET_ALL, params);
    return this.response(response);
  }

  public async get(component: Partial<ComponentGroup>, params?: IWorkbenchFilterParams): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_GET, component, params);
    return this.response(response);
  }
}

export const componentService = new ComponentService();
