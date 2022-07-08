import {IpcRendererEvent} from "electron";
import {IpcEvents} from "@api/ipc-events";

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send(channel: IpcEvents, ...args: unknown[]): void;
        on(channel: IpcEvents, func: (_event: IpcRendererEvent, ...args: unknown[]) => void): (() => void) | undefined;
        once(channel: IpcEvents, func: (_event: IpcRendererEvent, ...args: unknown[]) => void): void;
        invoke(channel: IpcEvents, ...args: unknown[]): Promise<any>;
        removeListener(channel: IpcEvents, func: (...args: any) => void): void;
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
