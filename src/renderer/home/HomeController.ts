import { IpcEvents } from '../../ipc-events';

const electron = window.require('electron');
const { remote } = electron;
const { dialog } = remote;
const fs = require('original-fs');

const { ipcRenderer } = require('electron');

export const openDialog = () => {
  ipcRenderer.on(IpcEvents.SCANNER_FINISH_SCAN, (event, args) => {
    console.log(args);
  });

  ipcRenderer.send(IpcEvents.SCANNER_INIT_SCAN, { path: 'test' });
  // const options = { properties: ['openDirectory'] };
  // const result = dialog.showOpenDialogSync(options);
  // return result ? result[0] : null;
};

export const scanDir = (path: string) => {
  const files = fs.readdirSync(path);
  if (files.length > 0) {
    // console.log(files);
    // let file = files.sort()[0];
    // var filepath = path.join(QUEUE_DIR, file);
  }
};

export default {
  openDialog,
};
