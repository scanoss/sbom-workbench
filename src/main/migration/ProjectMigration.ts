/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Migration } from './Migration';
import * as script0 from './scripts/0-0-0';
import {dbMigration} from './scripts/0120';


export class ProjectMigration extends Migration {
  private scripts: Record<string, Array<(data: string) => void>>;

  private projPath: string;

  constructor(appVersion: string, projPath: string) {
    super(appVersion);
    this.projPath = projPath;
    this.scripts = {
      '0.8.0': [], // Oldest compatible version
      '0.11.2' :[dbMigration],
    };
  }

  public getScripts() {
    return this.scripts;
  }

  public getPath() {
    return this.projPath;
  }
}
