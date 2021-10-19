/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Migration } from './Migration';
import * as script0 from './scripts/0-0-0';

export class ProjectMigration extends Migration {
  private scripts: Record<string, Array<(data: string) => void>>;

  private projPath: string;

  constructor(appVersion: string, projPath: string) {
    super(appVersion);
    this.projPath = projPath;
    this.scripts = {
      '0.8.0': [], // Oldest compatible version
    };
  }

  public getScripts() {
    return this.scripts;
  }

  public getPath() {
    return this.projPath;
  }
}
