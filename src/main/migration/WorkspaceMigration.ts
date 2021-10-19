/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Migration } from './Migration';
import * as script0 from './scripts/0-0-0';

export class WorkspaceMigration extends Migration {
  private scripts: Record<string, Array<(data: string) => void>>;

  private wsPath: string;

  constructor(appVersion: string, wsPath: string) {
    super(appVersion);
    this.wsPath = wsPath;
    this.scripts = {
      '0.11.1': [], // Oldest compatible version
    };
  }

  public getScripts() {
    return this.scripts;
  }

  public getPath() {
    return this.wsPath;
  }
}
