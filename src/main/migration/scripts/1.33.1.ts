import log from 'electron-log';
import sqlite3 from 'sqlite3';
import { Queries } from '../../model/querys_db';

export async function projectMigration1331(projectPath: string): Promise<void> {
  try {
    log.info('%cProject Migration 1.33.1 in progress...', 'color:green');
    await addUniqueConstraint(projectPath);
    log.info('%cProject Migration 1.33.1 finished', 'color:green');
  } catch (e: any) {
    log.error(e);
  }
}

async function addUniqueConstraint(projectPath: string): Promise<void> {
  const query = new Queries();
  return new Promise<void>((resolve, reject) => {
    const db = new sqlite3.Database(
      `${projectPath}/scan_db`,
      sqlite3.OPEN_READWRITE,
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        db.serialize(() => {
          db.run('PRAGMA foreign_keys = OFF;');

          // Remove duplicate files keeping the lowest fileId per path and those referenced in other tables
          db.run(
            `DELETE FROM files
             WHERE fileId NOT IN (
               SELECT f.fileId FROM files f
               WHERE f.fileId IN (SELECT fileId FROM results WHERE fileId NOT IN (SELECT MIN(fileId) FROM files GROUP BY path HAVING COUNT(*) > 1))
              OR f.fileId IN (SELECT fileId FROM dependencies WHERE fileId NOT IN (SELECT MIN(fileId) FROM files GROUP BY path HAVING COUNT(*) > 1))
              OR f.fileId IN (SELECT fileId FROM file_inventories WHERE fileId NOT IN (SELECT MIN(fileId) FROM files GROUP BY path HAVING COUNT(*) > 1))
              OR f.fileId IN (SELECT fileId FROM local_cryptography WHERE fileId NOT IN (SELECT MIN(fileId) FROM files GROUP BY path HAVING COUNT(*) > 1))
            );`,
            function (err) {
              if (err) log.error('Error removing duplicate files:', err);
              else log.info(`Removed ${this.changes} duplicate matched file entries`);
            }
          );
          // delete duplicated not match files and ignore files
          db.run(
            `DELETE FROM files
             WHERE fileId IN (SELECT MIN(fileId) FROM files GROUP BY path HAVING COUNT(*) > 1);`,
            function (err) {
              if (err) log.error('Error removing duplicate files:', err);
              else log.info(`Removed  ${this.changes} duplicate no match and ignore-files file entries`);
            }
          );

          // Recreate files table with UNIQUE constraint on path
          db.run(
            `CREATE TABLE files_backup (
              fileId INTEGER PRIMARY KEY ASC,
              path TEXT,
              identified INTEGER DEFAULT 0,
              ignored INTEGER DEFAULT 0,
              dirty INTEGER DEFAULT 0,
              type TEXT
            );`,
          );
          db.run('INSERT INTO files_backup SELECT * FROM files;');
          db.run('DROP TABLE files;');
          db.run(query.FILES_TABLE);
          db.run('INSERT OR IGNORE INTO files SELECT * FROM files_backup;');
          db.run('DROP TABLE files_backup;');

          db.run('PRAGMA foreign_keys = ON;', (err) => {
            db.close((closeErr) => {
              if (err || closeErr) {
                reject(err || closeErr);
              } else {
                resolve();
              }
            });
          });
        });
      },
    );
  });
}
