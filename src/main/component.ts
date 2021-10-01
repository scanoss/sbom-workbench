import { ipcMain } from 'electron';
import { Component, License, ComponentGroup } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { ComponentParams } from './db/scan_component_db';
import { Response } from './Response';
import { workspace } from './workspace/Workspace';

ipcMain.handle(IpcEvents.COMPONENT_GET_ALL, async (event, component: Component) => {
  const data = await workspace.getOpenedProjects()[0].scans_db.components.getAll(component);
  return { status: 'ok', message: 'Components retrieved successfully', data };
});

ipcMain.handle(IpcEvents.COMPONENT_GET, async (event, component: Component) => {
  const data = await workspace.getOpenedProjects()[0].scans_db.components.get(component);
  return { status: 'ok', message: 'Components retrieved successfully', data };
});

ipcMain.handle(IpcEvents.COMPONENT_CREATE, async (event, component: Component) => {
  try {
    const newComp = await workspace.getOpenedProjects()[0].scans_db.components.create(component);;
    return Response.ok({ message: 'Component created successfully', data: newComp });
  } catch (error) {
    console.log('Catch an error: ', error);
    return Response.fail({ message: error.message });v
  }
});

ipcMain.handle(IpcEvents.COMPONENT_ATTACH_LICENSE, async (event, comp: Component, lic: License) => {
  const link = { license_id: lic.id, compid: comp.compid };
  await workspace.getOpenedProjects()[0].scans_db.licenses.licenseAttach(link);
  return { status: 'ok', message: 'test' };
});

ipcMain.handle(IpcEvents.COMPONENT_GET_FILES, async (event, component: Component) => {
  const data = await workspace.getOpenedProjects()[0].scans_db.files.getFilesComponent(component);
  return { status: 'ok', message: 'test', data };
});

ipcMain.handle(IpcEvents.COMPONENT_GROUP_GET_ALL, async (event, params: ComponentParams) => {
  const data = await workspace.getOpenedProjects()[0].scans_db.components.getAllComponentGroup(params);
  return {
    status: 'ok',
    message: 'Components group retrieve successfully',
    data,
  };
});

ipcMain.handle(IpcEvents.COMPONENT_GROUP_GET, async (_event, component: Partial<ComponentGroup>) => {
  const data = await workspace.getOpenedProjects()[0].scans_db.components.getComponentGroup(component);
  return {
    status: 'ok',
    message: 'Component group retrieve successfully',
    data,
  };
});
