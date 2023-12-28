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
  const model = new Model(projectPath);
  const db = await model.openDb();
  const call = util.promisify(db.run.bind(db));
  await call('PRAGMA foreign_keys = OFF;');
  await call('CREATE TABLE temp_component_vulnerability AS SELECT * FROM component_vulnerability;');
  await call('DROP TABLE component_vulnerability;');
  await call(`CREATE TABLE IF NOT EXISTS component_vulnerability (
    purl varchar(45) NOT NULL,
    version varchar(45) NOT NULL,
    cve varchar(30) NOT NULL,
    rejectAt datetime,
    CONSTRAINT component_vulnerability_pk PRIMARY KEY (purl,version,cve),
    CONSTRAINT component_vulnerability_vulnerability FOREIGN KEY (cve) REFERENCES vulnerability (cve) ON DELETE CASCADE)
    ;`);
  await call('INSERT INTO component_vulnerability SELECT * FROM temp_component_vulnerability;');
  await call('DROP TABLE temp_component_vulnerability;');
  await call('PRAGMA foreign_keys = ON;');
  await db.close();
}
