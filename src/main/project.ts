import { ipcMain } from 'electron';
import { create } from 'electron-log';
// import { Component } from 'react';
import { Inventory, Component } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { defaultWorkspace } from './workspace/workspace';

ipcMain.handle(IpcEvents.INVENTORY_GET, async (event, invget: Inventory) => {
  let inv: any;
  try {
    inv = await defaultWorkspace.scans_db.getInventory(invget);
  } catch (e) {
    console.log('Catch an error: ', e);
  }
  console.log(inv.id);
  return { status: 'ok', message: inv };
});

ipcMain.handle(IpcEvents.INVENTORY_CREATE, async (event, arg: Inventory) => {
  let created: any;
  try {
    created = await defaultWorkspace.scans_db.createInventory(arg);
    arg.id = created;
    console.log('arg ' + arg);

    defaultWorkspace.attachInventory(arg);
    // defaultWorkspace.onAddInventory(newInventory);
  } catch (e) {
    console.log('Catch an error on inventory: ', e);
  }
  //console.log('la info de inventario es ');
  // console.log(arg);
  return { status: 'ok', message: created };
});
