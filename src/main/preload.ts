import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { IpcChannels } from '@api/ipc-channels';
import * as os from 'os';
import path from 'path';

const { shell } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send(channel: IpcChannels, ...args: any[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: IpcChannels, listener: (_event: IpcRendererEvent, ...args: any[]) => void) {
      ipcRenderer.on(channel, listener);
      return () => ipcRenderer.removeListener(channel, listener);
    },
    once(channel: IpcChannels, listener: (...args: any[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => listener(...args)); // TODO: use event
    },
    invoke(channel: IpcChannels, ...args: any[]): Promise<any> {
      return ipcRenderer.invoke(channel, ...args);
    },
    removeListener(channel: IpcChannels, listener: (...args: any[]) => void) {
      // const subscription = (_event: IpcRendererEvent, ...args: any) => func(...args);
      ipcRenderer.removeListener(channel, listener);
    },
  },
});

contextBridge.exposeInMainWorld('os', {
  homedir: () => os.homedir(),
});

contextBridge.exposeInMainWorld('path', {
  resolve: (p: string, s: string) => path.resolve(p, s),
  sep: path.sep,
  basename: (filepath, extension) => path.basename(filepath, extension),
  dirname: (filepath) => path.dirname(filepath),
});

contextBridge.exposeInMainWorld('shell', {
  openPath: (p: string) => {
    shell.openPath(p);
  },
  showItemInFolder: (p: string) => {
    shell.showItemInFolder(p);
  },
  openExternal: async (url: string, options?: Electron.OpenExternalOptions) => {
    await shell.openExternal(url, options);
  },
});

contextBridge.exposeInMainWorld('app', {
  getInfo: async () => ipcRenderer.invoke(IpcChannels.APP_GET_APP_INFO),
});
