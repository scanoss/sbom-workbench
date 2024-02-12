import { Migration } from './Migration';
import { wsMigration1120 } from './scripts/1.12.0';
import { wsMigration140 } from './scripts/140';
import { wsMigration151 } from './scripts/151';
import { wsMigration183 } from './scripts/183';
import { wsMigration184 } from './scripts/184';

export class AppMigration extends Migration {
  private scripts: Record<string, Array<(data: string) => void>>;

  private wsPath: string;

  constructor(appVersion: string, wsPath: string) {
    super(appVersion);
    this.wsPath = wsPath;
    this.scripts = {
      '0.11.1': [], // Oldest compatible version
      '1.12.1': [wsMigration1120],
    };
  }

  public getScripts(): Record<string, Array<(data: string) => any>> {
    return this.scripts;
  }

  public getPath() {
    return this.wsPath;
  }
}
