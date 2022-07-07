import { Channels } from 'main/preload';
import {IpcRendererEvent} from "electron";

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send(channel: Channels, ...args: unknown[]): void;
        on(channel: string, func: (_event: IpcRendererEvent, ...args: unknown[]) => void): (() => void) | undefined;
        once(channel: string, func: (_event: IpcRendererEvent, ...args: unknown[]) => void): void;
        invoke(channel: string, ...args: unknown[]): Promise<any>;
        removeListener(channel: string, func: (...args: any) => void): void;
      };
    };
    os: {
      homedir(): string;
    };
    shell: {
      showItemInFolder(path: string): void;
      openExternal(url: string, options?: Electron.OpenExternalOptions): Promise<void>;
    };
    path: {
      resolve(p: string, s: string): string;
      sep: string;
    };
  }
}

export {};
