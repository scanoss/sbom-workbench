import { ipcMain } from 'electron';
import { Component, License, ComponentGroup, ComponentParams } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { Response } from './Response';
import { logicComponentService } from './services/LogicComponentService';
import { workspace } from './workspace/Workspace';

ipcMain.handle(IpcEvents.COMPONENT_GET_ALL, async (event, component: Component) => {
  const project = workspace.getOpenedProjects()[0];
  const data = await logicComponentService.getAll(project.scans_db, component);
  return { status: 'ok', message: 'Components retrieved successfully', data };
});

ipcMain.handle(IpcEvents.COMPONENT_GET, async (event, id: number) => {
  const data = await workspace.getOpenedProjects()[0].scans_db.components.get(id);
  return { status: 'ok', message: 'Components retrieved successfully', data };
});

ipcMain.handle(IpcEvents.COMPONENT_CREATE, async (event, component: Component) => {
  try {
    const newComp = await workspace.getOpenedProjects()[0].scans_db.components.create(component);
    return Response.ok({ message: 'Component created successfully', data: newComp });
  } catch (error: any) {
    console.log('Catch an error: ', error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.COMPONENT_ATTACH_LICENSE, async (_event, comp: Component, lic: License) => {
  const link = { license_id: lic.id, compid: comp.compid };
  await workspace.getOpenedProjects()[0].scans_db.licenses.licenseAttach(link);
  return { status: 'ok', message: 'test' };
});

ipcMain.handle(IpcEvents.COMPONENT_GET_FILES, async (_event, component: Component, params) => {
  const project = workspace.getOpenedProjects()[0];
  const data = await logicComponentService.getComponentFiles(project.scans_db, component, params);
  return { status: 'ok', message: 'test', data };
});

ipcMain.handle(IpcEvents.COMPONENT_GROUP_GET_ALL, async (_event, params: ComponentParams) => {
  const project = workspace.getOpenedProjects()[0];
  const data = await logicComponentService.getAllComponentGroup(project.scans_db, params);
  return {
    status: 'ok',
    message: 'Components group retrieve successfully',
    data,
  };
});

ipcMain.handle(
  IpcEvents.COMPONENT_GROUP_GET,
  async (_event, component: Partial<ComponentGroup>, params: ComponentParams) => {
    const project = workspace.getOpenedProjects()[0];
    const data = await logicComponentService.getComponentGroup(project.scans_db, component, params);
    return {
      status: 'ok',
      message: 'Component group retrieve successfully',
      data,
    };
  }
);
