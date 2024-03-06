import sqlite3 from 'sqlite3';
import log from 'electron-log';
import util from 'util';
import { Model } from '../../model/Model';

export async function projectMigration193(projectPath: string): Promise<void> {
  log.info('Migration 1.9.3 In progress...');

  // Adds ON DELETE constraint on component_vulnerability table
  await addOnCascadeDeleteConstraint(projectPath);

  log.info('Migration 1.9.3 Finished');
}
async function addOnCascadeDeleteConstraint(projectPath:string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const db: any = new sqlite3.Database(
        `${projectPath}/scan_db`,
        sqlite3.OPEN_READWRITE,
        async (err: any) => {
          if (err) log.error(err);
          db.serialize(async () => {
            db.run('PRAGMA foreign_keys = OFF;');
            db.run('CREATE TABLE temp_component_vulnerability AS SELECT * FROM component_vulnerability;');
            db.run('DROP TABLE component_vulnerability;');
            db.run(`CREATE TABLE IF NOT EXISTS component_vulnerability (
                    purl varchar(45) NOT NULL,
                    version varchar(45) NOT NULL,
                    cve varchar(30) NOT NULL,
                    rejectAt datetime,
                    CONSTRAINT component_vulnerability_pk PRIMARY KEY (purl,version,cve),
                    CONSTRAINT component_vulnerability_vulnerability FOREIGN KEY (cve) REFERENCES vulnerability (cve) ON DELETE CASCADE)
                    ;`);
            db.run('INSERT INTO component_vulnerability SELECT * FROM temp_component_vulnerability;');
            db.run('DROP TABLE temp_component_vulnerability;');
            db.run('PRAGMA foreign_keys = ON;');
            db.close();
          });

          resolve();
        },
      );
    } catch (e) {
      reject(e);
    }
  });
}
