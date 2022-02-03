import sqlite3 from 'sqlite3';
import log from 'electron-log';

export async function dbLicenseMigration0200(projectPath): Promise<void> {
  log.info('%c[ MIGRATION ] IN PROGRESS...', 'color: green');
  return new Promise((resolve, reject) => {
    try {
      const db: any = new sqlite3.Database(`${projectPath}/scan_db`, sqlite3.OPEN_READWRITE, (err: any) => {
        if (err) log.error(err);

        db.run(
          "INSERT INTO licenses (spdxid,name,fulltext,url,official) VALUES ('LicenseRef-unknown','Unknown','Unknown License','',1);"
        );
        db.run(
          "INSERT INTO licenses (spdxid,name,fulltext,url,official) VALUES ('LicenseRef-basic-proprietary-commercial','Basic Proprietary Commercial','[PASTE YOUR LICENSE HERE]','',1)"
        );
        log.info('%c[ MIGRATION ] FINISHED', 'color: green');
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}
