export abstract class Migration {
  private version: string;

  constructor(version: string) {
    this.version = version;
  }

  public up() {
    const scripts = this.getScripts();
    const myVersion: string = this.getVersion();
    const oldestCompatibleVersion: string = Object.keys(scripts)[0];
    if (this.compareVersions(myVersion, oldestCompatibleVersion) === -1)
      // myVersion < oldCom....
      throw new Error(`Cannot upgrade version ${myVersion}`);
    Object.entries(scripts).forEach(([scriptsVersion, values]) => {
      if (this.compareVersions(myVersion, scriptsVersion) === -1) values.forEach((script) => script(this.getPath()));
    }, this);
  }

  public abstract getScripts(): Record<string, Array<(path: string) => void>>;

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
