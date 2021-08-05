import { ipcMain } from 'electron';
import { Component, License, ComponentGroup } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { defaultProject } from './workspace/ProjectTree';

ipcMain.handle(IpcEvents.COMPONENT_GET_ALL, async (event, component: Component) => {
  const data = await defaultProject.scans_db.components.getAll(component);
  return { status: 'ok', message: 'Components retrieved successfully', data };
});

ipcMain.handle(IpcEvents.COMPONENT_GET, async (event, component: Component) => {
  const data = await defaultProject.scans_db.components.get(component);
  return { status: 'ok', message: 'Components retrieved successfully', data };
});

ipcMain.handle(IpcEvents.COMPONENT_CREATE, async (event, component: Component) => {
  await defaultProject.scans_db.components.create(component);
  return { status: 'ok', message: 'test' };
});

ipcMain.handle(IpcEvents.COMPONENT_ATTACH_LICENSE, async (event, comp: Component, lic: License) => {
  const link = { license_id: lic.id, compid: comp.compid };
  await defaultProject.scans_db.licenses.licenseAttach(link);
  return { status: 'ok', message: 'test' };
});

ipcMain.handle(IpcEvents.COMPONENT_GET_FILES, async (event, component: Component) => {
  const data = await defaultProject.scans_db.files.getFilesComponent(component);
  return { status: 'ok', message: 'test', data };
});

ipcMain.handle(IpcEvents.COMPONENT_GROUP_GET_ALL, async (event) => {
  const data = await defaultProject.scans_db.components.getAllComponentGroup();
  return { status: 'ok', message: 'Components group retrieve successfully', data };
});

ipcMain.handle(IpcEvents.COMPONENT_GROUP_GET, async (_event, component: Partial<ComponentGroup>) => {
  const data = await defaultProject.scans_db.components.getComponentGroup(component);
  return { status: 'ok', message: 'Component group retrieve successfully', data };
});
