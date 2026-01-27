import { Migration } from './Migration';
import { dbLicenseMigration0200 } from './scripts/0200';
import { metadataMigration0210 } from './scripts/0210';
import { dependenciesMigration0220 } from './scripts/0220';
import { migration0230 } from './scripts/0230';
import { migration110 } from './scripts/110';
import { migration120 } from './scripts/120';
import { migration140 } from './scripts/140';
import { migration150 } from './scripts/150';
import { migration180 } from './scripts/180';
import { projectMigration183 } from './scripts/183';
import { projectMigration190 } from './scripts/0190';
import { projectMigration193 } from './scripts/0193';
import { projectMigration1124 } from './scripts/1.12.4';
import { projectMigration1130 } from './scripts/1.13.0';
import { projectMigration1161 } from './scripts/1.16.1';
import { projectMigration1170 } from './scripts/1.17.0';
import { projectMigration1180 } from './scripts/1.18.0';
import { projectMigration1190 } from './scripts/1.19.0';
import { projectMigration1290 } from './scripts/1.29.0';
import { projectMigration1300 } from './scripts/1.30.0';
import { projectMigration1310 } from './scripts/1.31.0';

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
      '1.4.0': [migration140],
      '1.5.0': [migration150], // Max version supported
      '1.8.0': [migration180],
      '1.8.3': [projectMigration183],
      '1.9.0': [projectMigration190],
      '1.9.3': [projectMigration193],
      '1.12.4': [projectMigration1124],
      '1.13.0': [projectMigration1130],
      '1.16.1': [projectMigration1161],
      '1.17.0': [projectMigration1170],
      '1.18.0': [projectMigration1180],
      '1.19.0': [projectMigration1190],
      '1.29.0': [projectMigration1290],
      '1.30.0': [projectMigration1300],
      '1.31.0': [projectMigration1310],
    };
  }

  public getScripts(): Record<string, Array<(data: string) => any>> {
    return this.scripts;
  }

  public getPath() {
    return this.projPath;
  }
}
