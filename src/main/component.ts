import { ipcMain } from 'electron';
import { Component } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { defaultWorkspace } from './workspace/workspace';
// import { Component } from '../renderer/workbench/WorkbenchProvider';

ipcMain.handle(IpcEvents.COMPONENT_GET, (event, arg: Component) => {
  const a = defaultWorkspace.scans_db.getComponent(arg);
  return { status: 'ok', message: a };
});

ipcMain.handle(IpcEvents.COMPONENT_CREATE, (event, arg: Component) => {
  // defaultWorkspace.scans_db.ncomponentNew(arg);
  return { status: 'ok', message: 'test' };
});
