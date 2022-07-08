import {IpcRendererEvent} from "electron";
import {IpcChannels} from "@api/ipc-channels";

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send(channel: IpcChannels, ...args: unknown[]): void;
        on(channel: IpcChannels, func: (_event: IpcRendererEvent, ...args: unknown[]) => void): (() => void) | undefined;
        once(channel: IpcChannels, func: (_event: IpcRendererEvent, ...args: unknown[]) => void): void;
        invoke(channel: IpcChannels, ...args: unknown[]): Promise<any>;
        removeListener(channel: IpcChannels, func: (...args: any) => void): void;
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
