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
import fs from 'fs';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import path from 'path';
import * as os from 'os';
import { wsCfgUpdate } from './main/migration/scripts/0-0-0';

import MenuBuilder from './main/menu';
import './main/inventory';
import './main/component';
import './main/project';
import './main/results';
import './main/file';
import './main/formats';
import './main/workspace';
import './main/report';
import './main/license';
import './main/controllers/userSetting';

import { IpcEvents } from './ipc-events';
import { workspace } from './main/workspace/Workspace';

import { Project } from './main/workspace/Project';

import { userSetting } from './main/UserSetting';

import { WorkspaceMigration } from './main/migration/WorkspaceMigration';

const basepath = require('path');

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

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
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
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
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

  const mainURL = `file://${__dirname}/index.html`;
  mainWindow.loadURL(mainURL);

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

  const menuBuilder = new MenuBuilder(mainWindow, mainURL);
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

app.whenReady().then(mainLogic).then(createWindow).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// TODO: move to isolate module (see menu.ts)

export interface IInitScan {
  path: string;
  scanId?: string;
}

async function mainLogic() {
  const root = `${os.homedir()}/scanoss-workspace`;

  // This lines will be removed in future versions
  if (fs.existsSync(`${root}/defaultCfg.json`)) {
    wsCfgUpdate(root);
  }

  await workspace.read(root);
  await userSetting.read(root);
  new WorkspaceMigration(userSetting.get().VERSION, root).up();
}

ipcMain.on(IpcEvents.SCANNER_INIT_SCAN, async (event, arg: IInitScan) => {
  const { path } = arg;
  const projectName = basepath.basename(path);
  const p: Project = new Project(projectName);
  // p.setConfig();
  // p.setFilters();
  await workspace.addProject(p);
  p.setScanPath(path);
  p.setMailbox(event.sender);
  await p.startScanner();
});
