import { ipcMain } from 'electron';
import { create } from 'electron-log';
// import { Component } from 'react';
import { Inventory, Component } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { defaultWorkspace } from './workspace/workspace';

ipcMain.handle(IpcEvents.INVENTORY_GET, async (event, invget: Inventory) => {
  let inv: any;
  try {
    inv = await defaultWorkspace.scans_db.inventories.get(invget);
  } catch (e) {
    console.log('Catch an error: ', e);
  }
  console.log(inv.id);
  return { status: 'ok', message: inv };
});

ipcMain.handle(IpcEvents.INVENTORY_CREATE, async (event, arg: Inventory) => {
  let created: any;
  try {
    const license = {
      // license_id: '',
      //  license_name: '',
      // license_spdxid: 'CC-BY-SA-3.0',
    };
    created = await defaultWorkspace.scans_db.inventories.get({});
    console.log(created);
    // defaultWorkspace.scans_db.components.get({}); //    // defaultWorkspace.onAddInventory(newInventory);
  } catch (e) {
    console.log('Catch an error on retrieving licences: ', e);
  }

  /* try {
    created = await defaultWorkspace.scans_db.inventories.create(arg);
    arg.id = created;
    defaultWorkspace.attachInventory(arg);
    // defaultWorkspace.onAddInventory(newInventory);
  } catch (e) {
    console.log('Catch an error on inventory: ', e);
  }*/
  return { status: 'ok', message: created };
});

/**
 * INVENTORY_CREATE = 'INVENTORY_CREATE',
  INVENTORY_GET = 'INVENTORY_GET',
  INVENTORY_DELETE = 'INVENTORY_DELETE',
  INVENTORY_UPDATE = 'INVENTORY_UPDATE',
  INVENTORY_ATTACH_FILE = 'INVENTORY_ATTACH_FILE',
  INVENTORY_DETACH_FILE = 'INVENTORY_DETACH_FILE',
 */
