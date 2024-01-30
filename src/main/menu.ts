import {
  app, Menu, shell, BrowserWindow, MenuItemConstructorOptions,
} from 'electron';
import path from 'path';
import i18next from 'i18next';
import { IpcChannels } from '../api/ipc-channels';
import AppConfig from '../config/AppConfigModule';
import { resolveHtmlPath } from './util';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => path.join(RESOURCES_PATH, ...paths);

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  mainURL: string;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.mainURL = resolveHtmlPath('index.html');
  }

  buildMenu(): Menu {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
      this.setupDevelopmentEnvironment();
    }

    const template = process.platform === 'darwin' ? this.buildDarwinTemplate() : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(): void {
    // FIXME: is not compatible con filetreee contextual menu

    /* this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    }); */
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const subMenuAbout: DarwinMenuItemConstructorOptions = {
      label: AppConfig.APP_NAME,
      submenu: [
        {
          label: i18next.t('AppMenu:NewProject'),
          accelerator: 'Command+N',
          click: () => {
            this.mainWindow.webContents.send(IpcChannels.MENU_NEW_PROJECT);
          },
        },
        {
          label: i18next.t('AppMenu:ImportProject'),
          click: () => {
            this.mainWindow.webContents.send(IpcChannels.MENU_IMPORT_PROJECT);
          },
        },
        {
          label: i18next.t('AppMenu:Settings'),
          accelerator: 'Command+,',
          click: () => {
            this.mainWindow.webContents.send(IpcChannels.MENU_OPEN_SETTINGS);
          },
        },
        {
          label: i18next.t('AppMenu:Quit'),
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    };
    const subMenuEdit: MenuItemConstructorOptions = {
      label: i18next.t('AppMenu:Edit'),
      submenu: [{ role: 'cut' }, { role: 'copy' }, { role: 'paste' }],
    };

    const subMenuViewDev: MenuItemConstructorOptions = {
      label: i18next.t('AppMenu:View'),
      submenu: [
        {
          label: i18next.t('AppMenu:Reload'),
          accelerator: 'Command+R',
          click: () => {
            this.mainWindow.webContents.reload();
          },
        },
        {
          label: i18next.t('AppMenu:ToggleFullScreen'),
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: i18next.t('AppMenu:OpenTranslationManagement'),
          click: () => {
            this.mainWindow.webContents.send(IpcChannels.MENU_OPEN_TRANSLATION_MANAGER);
          },
        },
        {
          label: i18next.t('AppMenu:ToggleDeveloperTools'),
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    };
    const subMenuViewProd: MenuItemConstructorOptions = {
      label: i18next.t('AppMenu:View'),
      submenu: [
        {
          label: i18next.t('AppMenu:ToggleFullScreen'),
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
      ],
    };
    const subMenuWindow: DarwinMenuItemConstructorOptions = {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:',
        },
        { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
        { type: 'separator' },
        { label: 'Bring All to Front', selector: 'arrangeInFront:' },
      ],
    };
    const subMenuHelp: MenuItemConstructorOptions = {
      label: i18next.t('AppMenu:Help'),
      submenu: [
        {
          label: i18next.t('AppMenu:About'),
          click: () => {
            this.buildAboutDialog();
          },
        },
      ],
    };

    const subMenuView = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true' ? subMenuViewDev : subMenuViewProd;

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
  }

  buildDefaultTemplate(): MenuItemConstructorOptions[] {
    const templateDefault = [
      {
        label: i18next.t('AppMenu:File'),
        submenu: [
          {
            label: i18next.t('AppMenu:NewProject'),
            accelerator: 'Ctrl+N',
            click: () => {
              this.mainWindow.webContents.send(IpcChannels.MENU_NEW_PROJECT);
            },
          },
          {
            label: i18next.t('AppMenu:ImportProject'),
            click: () => {
              this.mainWindow.webContents.send(IpcChannels.MENU_IMPORT_PROJECT);
            },
          },
          {
            label: i18next.t('AppMenu:Settings'),
            accelerator: 'Ctrl+Alt+S',
            click: () => {
              this.mainWindow.webContents.send(IpcChannels.MENU_OPEN_SETTINGS);
            },
          },
          {
            label: i18next.t('AppMenu:Close'),
            accelerator: 'Ctrl+W',
            click: () => {
              this.mainWindow.close();
            },
          },
        ],
      },
      {
        label: i18next.t('AppMenu:Edit'),
        submenu: [
          /* {role: 'undo'},
          {role: 'redo'},
          {type: 'separator'}, */
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          /* {role: 'pasteandmatchstyle'},
          {role: 'delete'},
          {role: 'selectall'} */
        ],
      },
      {
        label: i18next.t('AppMenu:View'),
        submenu:
          process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'
            ? [
              {
                label: i18next.t('AppMenu:Reload'),
                accelerator: 'Ctrl+R',
                click: () => {
                  this.mainWindow.webContents.reload();
                },
              },
              {
                label: i18next.t('AppMenu:OpenTranslationManagement'),
                click: () => {
                  this.mainWindow.webContents.send(IpcChannels.MENU_OPEN_TRANSLATION_MANAGER);
                },
              },
              {
                label: i18next.t('AppMenu:ToggleFullScreen'),
                accelerator: 'F11',
                click: () => {
                  this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
                },
              },
              {
                label: i18next.t('AppMenu:ToggleDeveloperTools'),
                accelerator: 'Alt+Ctrl+I',
                click: () => {
                  this.mainWindow.webContents.toggleDevTools();
                },
              },
            ]
            : [
              {
                label: i18next.t('AppMenu:ToggleFullScreen'),
                accelerator: 'F11',
                click: () => {
                  this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
                },
              },
            ],
      },
      {
        label: i18next.t('AppMenu:Help'),
        submenu: [
          {
            label: i18next.t('AppMenu:About'),
            click: () => {
              this.buildAboutDialog();
            },
          },
        ],
      },
    ];

    return templateDefault as MenuItemConstructorOptions[];
  }

  buildAboutDialog() {
    const aboutWindow = new BrowserWindow({
      title: AppConfig.APP_NAME,
      parent: this.mainWindow,
      resizable: false,
      width: 500,
      height: 500,
      modal: true,
      autoHideMenuBar: true,
      backgroundColor: '#e4e4e7',
      webPreferences: {
        devTools: false,
        sandbox: false,
        preload: app.isPackaged ? path.join(__dirname, 'preload.js') : path.join(__dirname, '../../.erb/dll/preload.js'),
      },
    });

    aboutWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key.toLowerCase() === 'escape') {
        event.preventDefault();
        aboutWindow.close();
      }
    });

    aboutWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: 'deny' };
    });

    aboutWindow.loadURL(`${this.mainURL}#/about`);
  }
}
