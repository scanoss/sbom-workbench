import sqlite3 from 'sqlite3';
import fs from 'fs';
import log from 'electron-log';
import { Metadata } from '../../workspace/Metadata';

export function dbMigration0130(projectPath: string) {
  log.info('%c[MIGRATION] IN PROGRESS...', 'color: green');
  const db: any = new sqlite3.Database(`${projectPath}/scan_db`, sqlite3.OPEN_READWRITE, (err: any) => {
    if (err) {
      log.error(err);
      throw new Error('Unable to migrate db database');
    }
    db.serialize(function () {
      db.run('PRAGMA journal_mode = WAL;');
      db.run('PRAGMA synchronous = OFF');
      db.run('PRAGMA foreign_keys = ON;');
      db.run('begin transaction');

      db.run('CREATE TABLE inventories_old AS select * from inventories;');
      db.run('DROP TABLE inventories;');

      db.run('CREATE TABLE IF NOT EXISTS inventories (id INTEGER PRIMARY KEY ,cvid INTEGER NOT NULL, usage TEXT, notes TEXT, url TEXT, spdxid TEXT, FOREIGN KEY (cvid) REFERENCES component_versions(id) ON  DELETE CASCADE );');

      db.run(`  INSERT INTO inventories (id, cvid , usage,notes,url,spdxid)
      SELECT iold.id , cv.id as cvid, iold.usage, iold.notes, iold.url, iold.spdxid
      FROM inventories_old iold INNER JOIN component_versions cv
      ON cv.purl = iold.purl AND cv.version = iold.version`);

      db.run('DROP TABLE inventories_old;');

      db.run('commit', () => {
        db.close();
      });
    });
  });

  log.info('%c[MIGRATION] FINISHED', 'color: green');
}

export function mt0130(projectPath: string) {
  const mtFile = fs.readFileSync(`${projectPath}/metadata.json`, 'utf8');
  const mt = JSON.parse(mtFile);
  if (mt.scannerState === 'SCANNED') mt.scannerState = 'FINISHED';
  fs.writeFileSync(`${projectPath}/metadata.json`, JSON.stringify(mt, undefined, 2), 'utf8');
}
