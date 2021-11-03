import { Migration } from './Migration';
import * as script0 from './scripts/0-0-0';
import { dbMigration0120 } from './scripts/0120';
import { dbMigration0130, mt0130 } from './scripts/0130';

export class ProjectMigration extends Migration {
  private scripts: Record<string, Array<(data: string) => void>>;

  private projPath: string;

  constructor(appVersion: string, projPath: string) {
    super(appVersion);
    this.projPath = projPath;
    this.scripts = {
      '0.8.0': [], // Oldest compatible version
      '0.11.2': [dbMigration0120],
      '0.13.0': [dbMigration0130, mt0130],
    };
  }

  public getScripts() {
    return this.scripts;
  }

  public getPath() {
    return this.projPath;
  }
}
