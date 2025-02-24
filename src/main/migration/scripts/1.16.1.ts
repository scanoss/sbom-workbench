import log from 'electron-log';
import sqlite3 from 'sqlite3';
import { Queries } from '../../model/querys_db';

export async function projectMigration1161(projectPath:string): Promise<void> {
  try {
    log.info('%cApp Migration 1.16.1 in progress...', 'color:green');
    await migrateResultTable(projectPath);
    log.info('%cApp Migration 1.16.1 finished', 'color:green');
  } catch (e: any) {
    log.error(e);
  }
}

async function migrateResultTable(projectPath: string) {
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
            db.run('CREATE TABLE temp_results AS SELECT * FROM results;');
            db.run('DROP TABLE results;');
            db.run(query.SQL_CREATE_TABLE_RESULTS);
            db.run(`INSERT INTO results
                    SELECT id, md5_file, fileId, vendor, component, version, latest_version, cpe,
                     url, lines, oss_lines, matched,  filename, size, idtype,  md5_comp,  compid, purl,
                      file_url, source, dirty, NULL as download_url
                    FROM temp_results;`);
            db.run('DROP TABLE temp_results;');
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
