import { IpcChannels } from "../../api/ipc-channels";
import { SemVerCompareVersion } from '../helpers/SemVer';
import { broadcastManager } from "../broadcastManager/BroadcastManager";
import { app } from 'electron';
import packageJson from '../../../release/app/package.json';

/* eslint-disable guard-for-in */
export abstract class Migration {
  private version: string;

  constructor(version: string) {
    this.version = version;
  }

  public async up(): Promise<string> {
    const scripts = this.getScripts();
    const myVersion: string = this.getVersion();
    const oldestCompatibleVersion: string = Object.keys(scripts)[0];
    let latestVersion = myVersion;
    if (SemVerCompareVersion(myVersion, oldestCompatibleVersion) === -1)
      throw new Error(`Cannot upgrade version ${myVersion}`); // myVersion < oldCom....
    broadcastManager.get().send(IpcChannels.MIGRATION_INIT, { data: `Migrating project to v ${app.isPackaged ? app.getVersion() : packageJson.version}` });
    for (const scriptsVersion in scripts) {
      const values = scripts[scriptsVersion];
      if (SemVerCompareVersion(myVersion, scriptsVersion) < 0) {
        for (let i = 0; i < values.length; i += 1) {
          // eslint-disable-next-line no-await-in-loop
          await values[i](this.getPath());
        }
        latestVersion = scriptsVersion;
      }
    }
    broadcastManager.get().send(IpcChannels.MIGRATION_FINISH);
    return latestVersion;
  }

  public abstract getScripts(): Record<string, Array<(path: string) => Promise<any>>>;

  public abstract getPath(): string;

  public getVersion() {
    return this.version;
  }
}
