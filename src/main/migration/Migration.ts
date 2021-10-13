export abstract class Migration {
  private version: string;

  constructor(version: string) {
    this.version = version;
  }

  public up() {
    const scripts = this.getScripts();
    const myVersion: string = this.getVersion();
    const oldestCompatibleVersion: string = Object.keys(scripts)[0];
    if (myVersion < oldestCompatibleVersion)
      throw new Error(`Cannot upgrade version ${myVersion} to ${oldestCompatibleVersion}`);
    for (const [scriptsVersion, scriptsList] of Object.entries(scripts)) {
      if (scriptsVersion >= myVersion) for (const script of scriptsList) script(this.getPath());
    }
  }

  public abstract getScripts(): Record<string, Array<(path: string) => void>>;

  public abstract getPath(): string;

  public getVersion() {
    return this.version;
  }
}
