import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import * as os from 'os';
import path from 'path';

const { shell } = require('electron');

export type Channels = 'ipc-example';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => func(...args);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    invoke(channel: string, ...args: unknown[]): Promise<any> {
      return ipcRenderer.invoke(channel, ...args);
    },
    removeListener(channel: string, func: (...args: any) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: any) => func(...args);
      ipcRenderer.removeListener(channel, subscription);
    },
  },
});

contextBridge.exposeInMainWorld('os', {
  homedir: () => {
    return os.homedir();
  },
});

contextBridge.exposeInMainWorld('path', {
  resolve: (p: string, s: string) => {
    return path.resolve(p, s);
  },
  sep: path.sep,
});

contextBridge.exposeInMainWorld('shell', {
  showItemInFolder: (p: string) => {
    shell.showItemInFolder(p);
  },
  openExternal: async (url: string, options?: Electron.OpenExternalOptions) => {
    await shell.openExternal(url, options);
  },
});
