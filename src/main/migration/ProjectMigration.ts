import { Migration } from './Migration';
import { dbLicenseMigration0200 } from './scripts/0200';

export class ProjectMigration extends Migration {
  private scripts: Record<string, Array<(data: string) => void>>;

  private projPath: string;

  constructor(appVersion: string, projPath: string) {
    super(appVersion);
    this.projPath = projPath;
    this.scripts = {
      '0.17.0': [], // Min version supported
      '0.20.0': [dbLicenseMigration0200],
    };
  }

  public getScripts(): Record<string, Array<(data: string) => any>> {
    return this.scripts;
  }

  public getPath() {
    return this.projPath;
  }
}
