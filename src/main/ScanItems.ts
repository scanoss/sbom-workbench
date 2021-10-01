import { ipcMain } from 'electron';
import { ItemInclude } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { defaultWorkspace } from './workspace/Workspace';
// import { Component } from '../renderer/workbench/WorkbenchProvider';

ipcMain.handle(IpcEvents.ITEM_INCLUDE, (event, arg: ItemInclude) => {
  const a = defaultWorkspace.scans_db.getComponent(arg);
  return { status: 'ok', message: a };
});

ipcMain.handle(IpcEvents.COMPONENT_CREATE, (event, arg: ItemInclude) => {
  if (arg.action === true)
    defaultWorkspace.include_file(arg.path, arg.recursive);
  else defaultWorkspace.exclude_file(arg.path, arg.recursive);
  return { status: 'ok', message: 'test' };
});
