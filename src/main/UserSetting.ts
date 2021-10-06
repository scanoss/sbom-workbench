import fs from 'fs';
import { IProject, IWorkspaceCfg } from '../api/types';
import { wsUtils } from './workspace/WsUtils/WsUtils';

/*
 {TOKEN: 'asdsa', AVAILABLE_} <-- userSetting.get()
*/

class UserSetting {
  private myPath: string;

  private name: string;

  private store: IWorkspaceCfg;

  private defaultStore: IWorkspaceCfg;

  constructor() {
    this.name = 'defaultCfg.json';
    this.defaultStore = {
      TOKEN: '',
      DEFAULT_URL_API: 0,
      AVAILABLE_URL_API: ['https://osskb.org/api/scan/direct'],
      SCAN_MODE: 'FULL_SCAN',
    };
    this.store = this.defaultStore;
  }

  public set(setting: Partial<IWorkspaceCfg>) {
      console.log(setting);
    this.store = { ...this.store, ...setting };
    return this.store;
  }

  public setSetting(key: string, value: string) {
    this.store[key] = value;
  }

  public get(): Partial<IWorkspaceCfg> {
    return this.store;
  }

  public getSetting(key: string) {
    const setting = { key: this.store[key] } as Partial<IWorkspaceCfg>;
    return setting;
  }

  public async read(path: string) {
    this.setMyPath(path);
    if (!(await wsUtils.fileExist(`${this.myPath}/${this.name}`))) await this.save();
    const setting = await fs.promises.readFile(`${this.myPath}/${this.name}`, 'utf8');
    this.store = JSON.parse(setting);
  }

  public async save() {
    await fs.promises.writeFile(`${this.myPath}/${this.name}`, JSON.stringify(this.store), 'utf8');
  }

  public setMyPath(path: string) {
    this.myPath = path;
  }
}

export const userSetting = new UserSetting();
