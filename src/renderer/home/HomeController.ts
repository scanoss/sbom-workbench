import { IpcEvents } from '../../ipc-events';

const { ipcRenderer } = require('electron');

export const scan = (path: string) => {
  ipcRenderer.send(IpcEvents.SCANNER_INIT_SCAN, { path });
};
