

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
    if (this.compareVersions(myVersion, oldestCompatibleVersion) === -1)
      throw new Error(`Cannot upgrade version ${myVersion}`); // myVersion < oldCom....

    for (let scriptsVersion in scripts) {
      const values = scripts[scriptsVersion];
      if (this.compareVersions(myVersion, scriptsVersion) < 0) {
        for (let i = 0; i < values.length; i += 1) {
          // eslint-disable-next-line no-await-in-loop
          await values[i](this.getPath());
        }
        latestVersion = scriptsVersion;
      }
    }

    return latestVersion;
  }

  public abstract getScripts(): Record<string, Array<(path: string) => Promise<boolean>>>;

  public abstract getPath(): string;

  public getVersion() {
    return this.version;
  }

  public compareVersions(ver1: string, ver2: string): number {
    const v1 = ver1.split('.').map((num) => parseInt(num, 10));
    const v2 = ver2.split('.').map((num) => parseInt(num, 10));

    for (let i = 0; i < v1.length; i += 1) {
      if (v1[i] > v2[i]) return 1;
      if (v1[i] < v2[i]) return -1;
    }
    return 0;
  }
}
