import { IpcRendererEvent } from 'electron';
import { IpcChannels } from '@api/ipc-channels';
import {IAppInfo} from "@api/dto";

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send(channel: IpcChannels, ...args: any[]): void;
        on(
          channel: IpcChannels,
          listener: (_event: IpcRendererEvent, ...args: any[]) => void
        ): (() => void) | undefined;
        once(channel: IpcChannels, listener: (_event: IpcRendererEvent, ...args: any[]) => void): void;
        invoke(channel: IpcChannels, ...args: any[]): Promise<any>;
        removeListener(channel: IpcChannels, listener: (...args: any[]) => void): void;
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
    app: {
      getInfo(): Promise<IAppInfo>;
    };
  }
}

export {};
