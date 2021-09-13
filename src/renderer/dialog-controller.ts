const electron = window.require('electron');
const { remote } = electron;
const { dialog } = remote;

class DialogController {
  public showOpenDialog(options): string {
    const result = dialog.showOpenDialogSync(remote.getCurrentWindow(), options);
    return result ? result[0] : null;
  }

  public showSaveDialog(options): string {
    const result = dialog.showSaveDialogSync(remote.getCurrentWindow(), options);
    return result;
  }

  public showError(title: string, content: string) {
    dialog.showErrorBox(title, content);
  }
}

export const dialogController = new DialogController();
