import { ipcRenderer } from 'electron';
import { IpcChannels } from '@api/ipc-channels';

class DialogController {
  public async showOpenDialog(options): Promise<string> {
    return window.electron.ipcRenderer.invoke(IpcChannels.DIALOG_SHOW_OPEN_DIALOG, options);
  }

  public showSaveDialog(options): Promise<string> {
    return window.electron.ipcRenderer.invoke(IpcChannels.DIALOG_SHOW_SAVE_DIALOG, options);
  }

  public showError(title: string, content: string): void {
    window.electron.ipcRenderer.send(IpcChannels.DIALOG_SHOW_ERROR_BOX, title, content);
  }
}

export const dialogController = new DialogController();
