import { ipcMain } from 'electron';
import { Inventory } from '../api/types';
import { IpcEvents } from '../ipc-events';

ipcMain.handle(IpcEvents.INVENTORY_GET, (event, id: number) => {
  console.log(id);
  return { status: 'ok', message: 'test' };
});

ipcMain.handle(IpcEvents.INVENTORY_CREATE, (event, arg: Inventory) => {
  console.log(arg.files);
  return { status: 'ok', message: 'test' };
});
