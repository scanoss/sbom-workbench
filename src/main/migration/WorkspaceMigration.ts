/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Migration } from './Migration';
import * as update000 from './scripts/0-0-0';


export class WorkspaceMigration extends Migration {
  private scripts: Record<string, Array<(data: string) => void>>;

  private wsPath: string;

  constructor(appVersion: string, wsPath: string) {
    super(appVersion);
    this.wsPath = wsPath;
    this.scripts = {      
      '0.10.0': [],
      '0.11.0': [],
      '0.11.1': [update000.updateVersion], // Build
    };
  }

  // public up() {
  //   const myVersion: string = super.getAppVersion();
  //   const oldestCompatibleVersion: string = Object.keys(this.scripts)[0];
  //   if (myVersion < oldestCompatibleVersion)
  //     throw new Error(`Cannot upgrade version ${myVersion} to ${oldestCompatibleVersion}`);
  //   for (const [scriptsVersion, scriptsList] of Object.entries(this.scripts))
  //     for (const script of scriptsList) script(this.wsPath);
  // }

  public getScripts(){
    return this.scripts;
  }


  public getPath(){
    return this.wsPath;
  }
}
