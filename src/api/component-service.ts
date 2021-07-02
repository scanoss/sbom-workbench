import { IpcEvents } from '../ipc-events';
import { Component } from './types';

const { ipcRenderer } = require('electron');

class ComponentService {
  public async get(id: number): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_GET, id);
    return response;
  }

  public async create(component: Component): Promise<any> {
    const response = await ipcRenderer.invoke(
      IpcEvents.COMPONENT_CREATE,
      component
    );
    return response;
  }
}

export const componentService = new ComponentService();
