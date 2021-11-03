import { Migration } from './Migration';
import * as script0 from './scripts/0-0-0';
import { dbMigration0120 } from './scripts/0120';
import { dbMigration0140, mt0140 } from './scripts/0140';

export class ProjectMigration extends Migration {
  private scripts: Record<string, Array<(data: string) => void>>;

  private projPath: string;

  constructor(appVersion: string, projPath: string) {
    super(appVersion);
    this.projPath = projPath;
    this.scripts = {
      '0.8.0': [], // Oldest compatible version
      '0.11.2': [dbMigration0120],
      '0.14.0': [dbMigration0140, mt0140],
    };
  }

  public getScripts() {
    return this.scripts;
  }

  public getPath() {
    return this.projPath;
  }
}
