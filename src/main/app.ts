/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/app.js` using webpack. This gives us some performance wins.
 */

import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import { app, BrowserWindow, dialog, RelaunchOptions, shell } from 'electron';
import path from 'path';
import AppConfig from '../config/AppConfigModule';
import { broadcastManager } from './broadcastManager/BroadcastManager';
import { resolveHtmlPath } from './util';
import { AppI18n, AppI18nContext } from '../shared/i18n';
import { userSettingService } from './services/UserSettingService';
import i18next from 'i18next';
import MenuBuilder from './menu';
import { workspace } from './workspace/Workspace';
import { modelProvider } from './services/ModelProvider';

// handlers
import '../api/index';

class AppUpdater {
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

const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')({ showDevTools: false });
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REDUX_DEVTOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged ? path.join(process.resourcesPath, 'assets') : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => path.join(RESOURCES_PATH, ...paths);

  mainWindow = new BrowserWindow({
    title: AppConfig.APP_NAME,
    show: false,
    width: 1330,
    height: 820,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      sandbox: false, // TODO:  remove de access from preload.js, see https://github.com/electron/electron/issues/36437
      preload: app.isPackaged ? path.join(__dirname, 'preload.js') : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  broadcastManager.set(mainWindow.webContents);
  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', async () => {
    mainWindow = null;
  });

  AppI18n.setLng(userSettingService.get().LNG);
  AppI18n.init(AppI18nContext.MAIN);

  AppI18n.getI18n().on('languageChanged', async (e) => {
    const { response } = await dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
      buttons: [i18next.t('Button:RestartLater'), i18next.t('Button:RestartNow')],
      message: i18next.t('Dialog:YouNeedRestartQuestionLanguage'),
    });

    if (response === 1) {
      const options: RelaunchOptions = {
        args: process.argv.slice(1).concat(['--relaunch']),
        execPath: process.execPath,
      };
      if (process.env.APPIMAGE) {
        options.execPath = process.env.APPIMAGE;
        options.args.unshift('--appimage-extract-and-run');
      }

      // Windows Portable
      if (process.env.PORTABLE_EXECUTABLE_FILE) {
        options.execPath = process.env.PORTABLE_EXECUTABLE_FILE;
      }

      app.relaunch(options);
      app.exit(0);
    }
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    // allow locize plugin open new window
    if (edata.url.endsWith('mini.locize.com/')) return { action: 'allow' };

    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', async () => {
  log.info('closing app');
  // Release all project on close app
  await workspace.closeAllProjects();
  await modelProvider.workspace.openDb();
  await modelProvider.workspace.lock.releaseProjects();
  await modelProvider.workspace.destroy();
  app.quit();
});

export function runApp(){
  app
    .whenReady()
    .then(async () => {
      await userSettingService.read();
      const settings = userSettingService.get();
      const defaultWorkspacePath = settings.WORKSPACES[settings.DEFAULT_WORKSPACE_INDEX].PATH;
      await workspace.read(defaultWorkspacePath);
      createWindow();
      app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) createWindow();
      });
    })
    .catch(console.log);
}
