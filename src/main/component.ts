import { ipcMain } from 'electron';
import { Component, License } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { defaultProject } from './workspace/ProjectTree';

ipcMain.handle(IpcEvents.COMPONENT_GET_ALL, async (event, arg: Component) => {
  const data = await defaultProject.scans_db.components.getAll(arg);    
  return { status: 'ok', message: 'Components retrieved successfully', data };
});

ipcMain.handle(IpcEvents.COMPONENT_CREATE, async (event, arg: Component) => {
  await defaultProject.scans_db.components.create(arg);
  return { status: 'ok', message: 'test' };
});

ipcMain.handle(IpcEvents.COMPONENT_ATTACH_LICENSE,async (event, comp: Component, lic: License) => {
    let link = { license_id: lic.id, compid: comp.compid };
    await defaultProject.scans_db.licenses.licenseAttach(link);
    return { status: 'ok', message: 'test' };
  }
);

ipcMain.handle(IpcEvents.COMPONENT_GET_FILES, async (event, arg: Component)=> {
  const data = await defaultProject.scans_db.files.getFilesComponent(arg);
  return { status: 'ok', message: 'test',data };
}
);

/*

COMPONENT_CREATE = 'COMPONENT_CREATE',
  COMPONENT_DELETE = 'COMPONENT_DELETE',
  COMPONENT_GET = 'COMPONENT_GET',
  COMPONENT_UPDATE = 'COMPONENT_UPDATE',
  COMPONENT_ATTACH_LICENSE = 'COMPONENT_ATTACH_LICENSE',
  COMPONENT_DETACH_LICENSE = 'COMPONENT_DETACH_LICENSE',
  */
