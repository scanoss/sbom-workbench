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
      '0.4.1': [(a)=>{console.log(`Se ejecuto el primer script`)}], // Oldest compatible version
      '0.11.2': [(a)=>{console.log(`Ejecutada actualizacion 0.11.2`)}], // Latest build
      '0.15.0': [(a)=>{console.log(`Ejecutada actualizacion 0.15.0`)}]
    };
  }

  public getScripts() {
    return this.scripts;
  }

  public getPath() {
    return this.projPath;
  }
}
