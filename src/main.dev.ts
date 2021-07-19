/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './main/menu';
import './main/inventory';
import './main/component';
import './main/project';
import './main/results';
import './main/file';
import { IpcEvents } from './ipc-events';
import { Workspace } from './main/workspace/workspace';
import { ItemExclude, Project } from './api/types';
import { ScanDb } from './main/db/scan_db';
import { licenses } from './main/db/licenses';

import { Scanner } from './main/scannerLib/Scanner';
import { SCANNER_EVENTS } from './main/scannerLib/ScannerEvents';
import { fstat } from 'fs';
import { isBinaryFile, isBinaryFileSync } from 'isbinaryfile';
const basepath = require('path');
const fs = require('fs');

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1280,
    height: 820,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// TODO: move to isolate module (see menu.ts)

export interface IInitScan {
  path: string;
  scanId?: string;
  // filter: IFilter[];
}

let ws: Workspace;

ipcMain.on(IpcEvents.SCANNER_INIT_SCAN, async (event, arg: IInitScan) => {
  ws = new Workspace();
  const scanner = new Scanner();
  const { path } = arg;
  let created: any;

  ws.newProject(path);
  await ws.projectsList.prepare_scan();
  scanner.setResultsPath(ws.projectsList.work_root);
  console.log(`SCANNER: Start scanning path=${path}`);
  scanner.setResultsPath(ws.projectsList.work_root);
  scanner.scanFolder(path);

  scanner.on(SCANNER_EVENTS.WINNOWING_STARTING, () => {
    console.log('Starting Winnowing...');
  });

  scanner.on(SCANNER_EVENTS.WINNOWING_NEW_WFP_FILE, (dir) =>
    console.log(`New WFP File on: ${dir}`)
  );

  scanner.on(SCANNER_EVENTS.WINNOWING_FINISHED, () => {
    console.log('Winnowing Finished...');
  });

  scanner.on(SCANNER_EVENTS.DISPATCHER_WFP_SENDED, (dir) => {
    console.log(`Sending WFP file ${dir} to server`);
  });

  scanner.on(SCANNER_EVENTS.DISPATCHER_NEW_DATA, async (data, fileNumbers) => {
    console.log(`New ${fileNumbers} files scanned`);
    await ws.projectsList.scans_db.files.insertFromJSON(data); 
  });

  scanner.on(SCANNER_EVENTS.SCAN_DONE, async (resultsPath) => {
    console.log(`Scan Finished... Results on: ${resultsPath}`);
    await ws.projectsList.scans_db.results.insertFromFile(resultsPath);
    await ws.projectsList.scans_db.components.importUniqueFromFile(resultsPath);

  
    /**
     * just because JSON is not accesible directly
     */
    let a = fs.readFileSync(`${resultsPath}`, 'utf8');
    ws.projectsList.results = JSON.parse(a);
    event.sender.send(IpcEvents.SCANNER_FINISH_SCAN, {
      success: true,
      resultsPath: ws.projectsList.work_root,
    });
    ws.projectsList.saveScanProject();
  });

  scanner.on('error', () => {
    scanner.stop();
    console.log('Scanner Error. Stoping....');
  });
});
