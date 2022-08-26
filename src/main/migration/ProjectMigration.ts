import { Migration } from './Migration';
import { dbLicenseMigration0200 } from './scripts/0200';
import { metadataMigration0210 } from './scripts/0210';
import { dependenciesMigration0220 } from './scripts/0220';
import { migration0230 } from './scripts/0230';
import { migration110 } from './scripts/110';
import { migration120 } from './scripts/120';
import { migration140 } from './scripts/140';

export class ProjectMigration extends Migration {
  private scripts: Record<string, Array<(data: string) => void>>;

  private projPath: string;

  constructor(appVersion: string, projPath: string) {
    super(appVersion);
    this.projPath = projPath;
    this.scripts = {
      '0.17.0': [], // Min version supported
      '0.20.0': [dbLicenseMigration0200],
      '0.21.0': [metadataMigration0210],
      '0.22.0': [dependenciesMigration0220],
      '0.23.0': [migration0230],
      '1.1.0': [migration110],
      '1.2.0': [migration120],
      '1.4.0': [migration140], // Max version supported
    };
  }

  public getScripts(): Record<string, Array<(data: string) => any>> {
    return this.scripts;
  }

  public getPath() {
    return this.projPath;
  }
}
