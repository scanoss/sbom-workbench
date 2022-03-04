import { ipcMain } from 'electron';
import { Component, License, ComponentGroup, IWorkbenchFilter, IProject } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { Response } from './Response';
import { logicComponentService } from './services/LogicComponentService';
import { logictTreeService } from './services/LogicTreeService';
import { workspace } from './workspace/Workspace';

ipcMain.handle(IpcEvents.COMPONENT_CREATE, async (event, component: Component) => {
  try {
    const newComp = await workspace.getOpenedProjects()[0].store.component.create(component);
    return Response.ok({ message: 'Component created successfully', data: newComp });
  } catch (error: any) {
    console.log('Catch an error: ', error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.COMPONENT_ATTACH_LICENSE, async (_event, comp: Component, lic: License) => {
  const link = { license_id: lic.id, compid: comp.compid };
  await workspace.getOpenedProjects()[0].store.license.licenseAttach(link);
  return { status: 'ok', message: 'test' };
});

ipcMain.handle(IpcEvents.COMPONENT_GET_FILES, async (_event, component: Component, params) => {
  const filter = workspace.getOpenedProjects()[0].getFilter();
  const data = await logicComponentService.getComponentFiles(component, { ...filter, ...params });
  return { status: 'ok', message: 'test', data };
});

ipcMain.handle(IpcEvents.COMPONENT_GET_ALL, async (_event, params: IWorkbenchFilter) => {
  const filter = workspace.getOpenedProjects()[0].getFilter();
  const data = await logicComponentService.getAll({ ...filter, ...params });
  return {
    status: 'ok',
    message: 'Components group retrieve successfully',
    data,
  };
});

ipcMain.handle(
  IpcEvents.COMPONENT_GET,
  async (_event, component: Partial<ComponentGroup>, params: IWorkbenchFilter) => {
    const data = await logicComponentService.get(component, params);
    return {
      status: 'ok',
      message: 'Component group retrieve successfully',
      data,
    };
  }
);
