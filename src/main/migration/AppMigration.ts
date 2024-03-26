import { Migration } from './Migration';
import { wsMigration1120 } from './scripts/1.12.0';
import { appMigration1123 } from './scripts/1.12.3';
import { appMigration1124 } from './scripts/1.12.4';

export class AppMigration extends Migration {
  private scripts: Record<string, Array<(data: string) => void>>;

  private wsPath: string;

  constructor(appVersion: string, wsPath: string) {
    super(appVersion);
    this.wsPath = wsPath;
    this.scripts = {
      '0.11.1': [], // Oldest compatible version
      '1.12.0': [wsMigration1120],
      '1.12.3': [appMigration1123],
      '1.12.4': [appMigration1124],
    };
  }

  public getScripts(): Record<string, Array<(data: string) => any>> {
    return this.scripts;
  }

  public getPath() {
    return this.wsPath;
  }
}
