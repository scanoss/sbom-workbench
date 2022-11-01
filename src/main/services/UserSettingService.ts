import { app } from 'electron';
import fs from 'fs';
import { IWorkspaceCfg } from '../../api/types';
import { wsUtils } from '../workspace/WsUtils/WsUtils';

import packageJson from '../../../release/app/package.json';
import AppConfig from '../../config/AppConfigModule';
import { AppI18n } from '../../shared/i18n';

class UserSettingService {
  private myPath: string;

  private name: string;

  private store: IWorkspaceCfg;

  private defaultStore: IWorkspaceCfg = {
    TOKEN: '',
    DEFAULT_API_INDEX: 0,
    APIS: [
      {
        URL: `${AppConfig.API_URL}/scan/direct`,
        API_KEY: `${AppConfig.API_KEY}`,
        DESCRIPTION: '',
      },
    ],
    SCAN_MODE: 'FULL_SCAN',
    VERSION: app.isPackaged === true ? app.getVersion() : packageJson.version,
    LNG: 'en',
  };

  constructor() {
    this.name = 'workspaceCfg.json';
    this.store = this.defaultStore;
  }

  public set(setting: Partial<IWorkspaceCfg>) {
    if (setting.LNG !== this.store.LNG)
      AppI18n.getI18n().changeLanguage(setting.LNG);

    this.store = { ...this.store, ...setting };

    return this.store;
  }

  public setSetting(key: string, value: string) {
    this.store[key] = value;
  }

  public get(): Partial<IWorkspaceCfg> {
    return JSON.parse(JSON.stringify(this.store));
  }

  public getSetting(key: string) {
    const setting = { key: this.store[key] } as Partial<IWorkspaceCfg>;
    return setting;
  }

  public getDefault(): IWorkspaceCfg {
    return this.defaultStore;
  }

  public async read(path: string) {
    this.setMyPath(path);
    if (!(await wsUtils.fileExist(`${this.myPath}/${this.name}`)))
      await this.save();
    const setting = await fs.promises.readFile(
      `${this.myPath}/${this.name}`,
      'utf8'
    );
    this.store = JSON.parse(setting);
  }

  public async update(): Promise<void> {
    this.store.APIS[0] = {
      URL: `${AppConfig.API_URL}/scan/direct`,
      API_KEY: `${AppConfig.API_KEY}`,
      DESCRIPTION: '',
    };
    await this.save();
  }

  public async save() {
    await fs.promises.writeFile(
      `${this.myPath}/${this.name}`,
      JSON.stringify(this.store, undefined, 2),
      'utf8'
    );
  }

  public setMyPath(path: string) {
    this.myPath = path;
  }
}

export const userSettingService = new UserSettingService();
