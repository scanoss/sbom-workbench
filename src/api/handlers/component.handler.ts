import { ipcMain } from 'electron';
import { Component, License, ComponentGroup, IWorkbenchFilterParams } from '../types';
import { IpcEvents } from '../ipc-events';
import { Response } from '../Response';
import { componentService } from '../../main/services/ComponentService';
import { workspace } from '../../main/workspace/Workspace';

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

ipcMain.handle(IpcEvents.COMPONENT_GET_FILES, async (_event, component: Component, params: IWorkbenchFilterParams) => {
  const filter = workspace.getOpenedProjects()[0].getFilter(params);
  const data = await componentService.getComponentFiles(component, filter);
  return { status: 'ok', message: 'test', data };
});

ipcMain.handle(IpcEvents.COMPONENT_GET_ALL, async (_event, params: IWorkbenchFilterParams) => {
  try {
    const filter = workspace.getOpenedProjects()[0].getFilter(params);
    const data = await componentService.getAll(filter);
    return {
      status: 'ok',
      message: 'Components getAll retrieve successfully',
      data,
    };
  } catch (e) {
    return { status: 'fail' };
  }
});

ipcMain.handle(
  IpcEvents.COMPONENT_GET,
  async (_event, component: Partial<ComponentGroup>, params: IWorkbenchFilterParams) => {
    try {
      const filter = workspace.getOpenedProjects()[0].getFilter(params);
      const data = await componentService.get(component, filter);
      return { status: 'ok', message: 'Component group retrieve successfully', data };
    } catch (e) {
      return { status: 'fail' };
    }
  }
);
