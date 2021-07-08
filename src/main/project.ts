import { ipcMain } from 'electron';
import { create } from 'electron-log';
// import { Component } from 'react';
import { Inventory, Component, Project } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { ScanDb } from './db/scan_db';
import { defaultWorkspace } from './workspace/workspace';

/* ipcMain.handle(IpcEvents.INVENTORY_GET, async (_event, invget: Inventory) => {
  let inv: any;
  try {
    inv = await defaultWorkspace.scans_db.inventories.get(invget);
  } catch (e) {
    console.log('Catch an error: ', e);
  }
  console.log(inv.id);
  return { status: 'ok', message: inv };
}); */

ipcMain.handle(IpcEvents.PROJECT_CREATE_SCAN, async (_event, arg: Project) => {
  let created: any;
  let p: Project = {
    work_root: '/home/oscar/test',
    default_licenses: '/home/oscar/test/licenses.json',
  };
  try {
    defaultWorkspace.scans_db = new ScanDb(p.work_root);
    const init = await defaultWorkspace.scans_db.init();
    if (p.default_licenses !== undefined)
      defaultWorkspace.scans_db.licenses.importFromFile(p.default_licenses);
    /* if (p.default_components !== undefined)
      defaultWorkspace.scans_db.components.importFromFile(p.default_components);
    */
    console.log(`base abierta ${init}`);
  } catch (e) {
    console.log('Catch an error on creating a project: ', e);
  }
  return { status: 'ok', message: 'ok' };
});
