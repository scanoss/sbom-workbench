import { app, Menu, shell, BrowserWindow, MenuItemConstructorOptions } from 'electron';
import path from 'path';
import { IpcEvents } from '../ipc-events';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  mainURL: string;

  constructor(mainWindow: BrowserWindow, main: string) {
    this.mainWindow = mainWindow;
    this.mainURL = main;
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
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const self = this;
    const subMenuAbout: DarwinMenuItemConstructorOptions = {
      label: 'Scanoss',
      submenu: [
        {
          label: '&New project',
          accelerator: 'Command+N',
          click: () => {
            this.mainWindow.webContents.send(IpcEvents.MENU_NEW_PROJECT);
          },
        },
        {
          label: '&Settings',
          accelerator: 'Command+,',
          click: () => {
            this.mainWindow.webContents.send(IpcEvents.MENU_OPEN_SETTINGS);
          },
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    };
    const subMenuEdit: MenuItemConstructorOptions = {
      label: '&Edit',
      submenu: [{ role: 'cut' }, { role: 'copy' }, { role: 'paste' }],
    };

    const subMenuViewDev: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: () => {
            this.mainWindow.webContents.reload();
          },
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    };
    const subMenuViewProd: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Full Screen',
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
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click() {
            self.buildAboutDialog();
          },
        },
      ],
    };

    const subMenuView =
      process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true' ? subMenuViewDev : subMenuViewProd;

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
  }

  buildDefaultTemplate() {
    const templateDefault = [
      {
        label: '&File',
        submenu: [
          {
            label: '&New project',
            accelerator: 'Ctrl+N',
            click: () => {
              this.mainWindow.webContents.send(IpcEvents.MENU_NEW_PROJECT);
            },
          },
          {
            label: '&Settings',
            accelerator: 'Ctrl+Alt+S',
            click: () => {
              this.mainWindow.webContents.send(IpcEvents.MENU_OPEN_SETTINGS);
            },
          },
          {
            label: '&Close',
            accelerator: 'Ctrl+W',
            click: () => {
              this.mainWindow.close();
            },
          },
        ],
      },
      {
        label: '&Edit',
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
        label: '&View',
        submenu:
          process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'
            ? [
                {
                  label: '&Reload',
                  accelerator: 'Ctrl+R',
                  click: () => {
                    this.mainWindow.webContents.reload();
                  },
                },
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
                  },
                },
                {
                  label: 'Toggle &Developer Tools',
                  accelerator: 'Alt+Ctrl+I',
                  click: () => {
                    this.mainWindow.webContents.toggleDevTools();
                  },
                },
              ]
            : [
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
                  },
                },
              ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About',
            click: () => {
              this.buildAboutDialog();
            },
          },
        ],
      },
    ];

    return templateDefault;
  }

  buildAboutDialog() {
    const aboutWindow = new BrowserWindow({
      parent: this.mainWindow,
      resizable: false,
      width: 500,
      height: 500,
      modal: true,
      autoHideMenuBar: true,
      backgroundColor: '#e4e4e7',
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        devTools: false,
      },
    });

    aboutWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key.toLowerCase() === 'escape') {
        event.preventDefault()
        aboutWindow.close();
      }
    });

    aboutWindow.webContents.on('new-window', (event, url) => {
      event.preventDefault();
      shell.openExternal(url);
    });

    aboutWindow.loadURL(`${this.mainURL}#/about`);
  }
}
