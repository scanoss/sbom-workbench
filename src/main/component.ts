import { ipcMain } from 'electron';
import { Component } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { defaultWorkspace } from './workspace/workspace';
// import { Component } from '../renderer/workbench/WorkbenchProvider';

ipcMain.handle(IpcEvents.COMPONENT_GET, async (event, arg: Component) => {
  const a = await defaultWorkspace.scans_db.components.get(arg);
  return { status: 'ok', message: a };
});

ipcMain.handle(IpcEvents.COMPONENT_CREATE, async (event, arg: Component) => {
  await defaultWorkspace.scans_db.components.create(arg);
  return { status: 'ok', message: 'test' };
});

/*

COMPONENT_CREATE = 'COMPONENT_CREATE',
  COMPONENT_DELETE = 'COMPONENT_DELETE',
  COMPONENT_GET = 'COMPONENT_GET',
  COMPONENT_UPDATE = 'COMPONENT_UPDATE',
  COMPONENT_ATTACH_LICENSE = 'COMPONENT_ATTACH_LICENSE',
  COMPONENT_DETACH_LICENSE = 'COMPONENT_DETACH_LICENSE',
  */
