import { ipcMain } from 'electron';
import { create } from 'electron-log';
// import { Component } from 'react';
import { Inventory, Component } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { defaultWorkspace } from './workspace/workspace';

ipcMain.handle(IpcEvents.INVENTORY_GET, async (_event, invget: Inventory) => {
  let inv: any;
  try {
    inv = await defaultWorkspace.scans_db.inventories.get(invget);
  } catch (e) {
    console.log('Catch an error: ', e);
  }
  console.log(inv.id);
  return { status: 'ok', message: inv };
});

ipcMain.handle(IpcEvents.INVENTORY_CREATE, async (_event, arg: Inventory) => {
  let created: any;
  try {
    created = await defaultWorkspace.scans_db.inventories.create(arg);
    arg.id = created;
    defaultWorkspace.attachInventory(arg);
  } catch (e) {
    console.log('Catch an error on inventory: ', e);
  }

  return { status: 'ok', message: created };
});
