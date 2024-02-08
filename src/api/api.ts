import { IpcChannels } from './ipc-channels';
import { ipcMain } from 'electron';
import { Response } from './Response';

type Middleware = (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any;
class Api {
  private store: Record<string, Middleware[]>; //Keeps the channel associated with middlewares

  constructor() {
    this.store = {};
  }
  public use(channel: IpcChannels, ...middleware: Middleware[]) {
    if (!this.store[channel]) this.store[channel] = [];
    this.store[channel] = [...this.store[channel], ...middleware];
  }

  public handle(channel: string, handler: any) {
    if (!this.store[channel]) this.store[channel] = [];

    ipcMain.handle(channel, async (_event, ...args: any[]) => {
      try {
        for (const m of this.store[channel]) {
          await m(_event, ...args);
        }
        return await handler(_event, ...args);
      } catch (e: any) {
        if (e instanceof Error) {
          return Response.fail({ message: e.message, data: e });
        } else {
          return Response.fail({ message: 'An unknown error occurred', data: e });
        }
      }
    });
  }
}

const api = new Api();
export default api;
