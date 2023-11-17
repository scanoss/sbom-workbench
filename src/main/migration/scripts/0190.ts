import sqlite3 from 'sqlite3';
import log from 'electron-log';
import { Querys } from '../../model/querys_db';

export async function projectMigration190(projectPath: string): Promise<void> {
  log.info('Migration 1.9.0 In progress...');
  await addCryptographyTable(projectPath);
}
async function addCryptographyTable(projectPath:string): Promise<void> {
  const query = new Querys();
  return new Promise((resolve, reject) => {
    try {
      const db: any = new sqlite3.Database(
        `${projectPath}/scan_db`,
        sqlite3.OPEN_READWRITE,
        (err: any) => {
          if (err) log.error(err);
          db.run(query.CRYPTOGRAPHY_TABLE);
          db.close();
          resolve();
        },
      );
    } catch (e) {
      reject(e);
    }
  });
}
