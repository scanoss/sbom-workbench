import { Migration } from './Migration';
import { wsMigration140 } from './scripts/140';

export class WorkspaceMigration extends Migration {
  private scripts: Record<string, Array<(data: string) => void>>;

  private wsPath: string;

  constructor(appVersion: string,wsPath: string) {
    super(appVersion);
    this.wsPath = wsPath;
    this.scripts = {
      '0.11.1': [], // Oldest compatible version
      '1.4.0': [wsMigration140],
    }
  }

  public getScripts(): Record<string, Array<(data: string) => any>>  {
    return this.scripts;
  }

  public getPath() {
    return this.wsPath;
  }
}
