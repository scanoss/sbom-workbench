import { IpcEvents } from '../ipc-events';
import { Component, License } from './types';

const { ipcRenderer } = require('electron');

class ComponentService {
  public async get(args: Partial<Component>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_GET, args);
    return response;
  }

  public async getAll(args: Partial<Component>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_GET_ALL, args);
    return response;
  }

  public async create(component: Component): Promise<any> {
    const response = await ipcRenderer.invoke(
      IpcEvents.COMPONENT_CREATE,
      component
    );
    return response;
  }

  public async delete(component: Partial<Component>): Promise<any> {
    const response = await ipcRenderer.invoke(
      IpcEvents.COMPONENT_DELETE,
      component
    );
    return response;
  }

  public async attachLicense(
    component: Partial<Component>,
    license: Partial<License>
  ): Promise<any> {
    const response = await ipcRenderer.invoke(
      IpcEvents.COMPONENT_ATTACH_LICENSE,
      component,
      license
    );
    return response;
  }

  public async detachLicense(
    component: Component,
    license: License
  ): Promise<any> {
    const response = await ipcRenderer.invoke(
      IpcEvents.COMPONENT_DETACH_LICENSE,
      component,
      license
    );
    return response;
  }
}

export const componentService = new ComponentService();

/*
COMPONENT_CREATE = 'COMPONENT_CREATE',
  COMPONENT_DELETE = 'COMPONENT_DELETE',
  COMPONENT_GET = 'COMPONENT_GET',
  COMPONENT_UPDATE = 'COMPONENT_UPDATE',
  COMPONENT_ATTACH_LICENSE = 'COMPONENT_ATTACH_LICENSE',
  COMPONENT_DETACH_LICENSE = 'COMPONENT_DETACH_LICENSE', */
