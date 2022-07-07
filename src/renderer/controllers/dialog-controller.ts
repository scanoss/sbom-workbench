import { ipcRenderer } from 'electron';
import { IpcEvents } from '@api/ipc-events';

class DialogController {
  public async showOpenDialog(options): Promise<string> {
    return window.electron.ipcRenderer.invoke(IpcEvents.DIALOG_SHOW_OPEN_DIALOG, options);
  }

  public showSaveDialog(options): Promise<string> {
    return window.electron.ipcRenderer.invoke(IpcEvents.DIALOG_SHOW_SAVE_DIALOG, options);
  }

  public showError(title: string, content: string): void {
    window.electron.ipcRenderer.send(IpcEvents.DIALOG_SHOW_ERROR_BOX, title, content);
  }
}

export const dialogController = new DialogController();
