import { SemVerCompareVersion } from '../helpers/SemVer';

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

    return latestVersion;
  }

  public abstract getScripts(): Record<string, Array<(path: string) => Promise<any>>>;

  public abstract getPath(): string;

  public getVersion() {
    return this.version;
  }
}
