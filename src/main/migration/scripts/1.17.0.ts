import log from 'electron-log';
import sqlite3 from 'sqlite3';
import { Queries } from '../../model/querys_db';

export async function projectMigration1170(projectPath:string): Promise<void> {
  try {
    log.info('%cApp Migration 1.17.0 in progress...', 'color:green');
    await migrateCryptographyTable(projectPath);
    await migrateLocalCryptographyTable(projectPath);
    log.info('%cApp Migration 1.17.0 finished', 'color:green');
  } catch (e: any) {
    log.error(e);
  }
}

async function migrateCryptographyTable(projectPath: string) {
  const query = new Queries();
  return new Promise<void>((resolve, reject) => {
    try {
      const db: any = new sqlite3.Database(
        `${projectPath}/scan_db`,
        sqlite3.OPEN_READWRITE,
        async (err: any) => {
          if (err) log.error(err);
          db.serialize(async () => {
            db.run('PRAGMA foreign_keys = OFF;');
            db.run('CREATE TABLE temp_cryptography AS SELECT * FROM cryptography;');
            db.run('DROP TABLE cryptography;');
            db.run(query.CRYPTOGRAPHY_TABLE);
            db.run(`INSERT INTO cryptography (purl, version, algorithms, hints)
            SELECT purl, version, algorithms, '[]' as hints FROM temp_cryptography;`);
            db.run('DROP TABLE temp_cryptography;');
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

async function migrateLocalCryptographyTable(projectPath: string) {
  const query = new Queries();
  return new Promise<void>((resolve, reject) => {
    try {
      const db: any = new sqlite3.Database(
        `${projectPath}/scan_db`,
        sqlite3.OPEN_READWRITE,
        async (err: any) => {
          if (err) log.error(err);
          db.serialize(async () => {
            db.run('PRAGMA foreign_keys = OFF;');
            db.run('CREATE TABLE temp_local_cryptography AS SELECT * FROM local_cryptography;');
            db.run('DROP TABLE local_cryptography;');
            db.run(query.LOCAL_CRYPTOGRAPHY_TABLE);
            db.run(`INSERT INTO local_cryptography (id, file_id, algorithms, hints)
            SELECT id, file_id, algorithms, '[]' as hints FROM temp_local_cryptography;`);
            db.run('DROP TABLE temp_local_cryptography;');
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
