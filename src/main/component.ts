import { ipcMain } from 'electron';
import { Component, License } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { defaultProject } from './workspace/ProjectTree';

ipcMain.handle(IpcEvents.COMPONENT_GET_ALL, async (event, arg: Component) => {
  const data = await defaultProject.scans_db.components.getAll(arg);   
  return { status: 'ok', message: 'Components retrieved successfully', data };
});

ipcMain.handle(IpcEvents.COMPONENT_GET, async (event, arg: Component) => {
  const data = await defaultProject.scans_db.components.get(arg);    
  return { status: 'ok', message: 'Components retrieved successfully', data };
});

ipcMain.handle(IpcEvents.COMPONENT_CREATE, async (event, arg: Component) => {
  await defaultProject.scans_db.components.create(arg);
  return { status: 'ok', message: 'test' };
});

ipcMain.handle(IpcEvents.COMPONENT_ATTACH_LICENSE,async (event, comp: Component, lic: License) => {
    const link = { license_id: lic.id, compid: comp.compid };
    await defaultProject.scans_db.licenses.licenseAttach(link);
    return { status: 'ok', message: 'test' };
  }
);

ipcMain.handle(IpcEvents.COMPONENT_GET_FILES, async (event, arg: Component)=> {
  const data = await defaultProject.scans_db.files.getFilesComponent(arg);
  return { status: 'ok', message: 'test',data };
});

ipcMain.handle(IpcEvents.COMPONENT_VERSIONS, async (event)=> {
  const comp = await defaultProject.scans_db.components.getCompVersions();
  return { status: 'ok', message: 'Component versions retrieve successfully', comp };
});

/*

COMPONENT_CREATE = 'COMPONENT_CREATE',
  COMPONENT_DELETE = 'COMPONENT_DELETE',
  COMPONENT_GET = 'COMPONENT_GET',
  COMPONENT_UPDATE = 'COMPONENT_UPDATE',
  COMPONENT_ATTACH_LICENSE = 'COMPONENT_ATTACH_LICENSE',
  COMPONENT_DETACH_LICENSE = 'COMPONENT_DETACH_LICENSE',
  */
