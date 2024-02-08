import sqlite3 from 'sqlite3';
import log from 'electron-log';

export class Connection {
  protected dbPath: string;

  public static readonly entityMapper = {};

  constructor(path: string) {
    this.dbPath = path;
  }

  public createDB() {
    return new Promise<sqlite3.Database>((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (err: any) => {
        if (err) {
          reject(new Error('Unable to create DB'));
        } else {
          resolve(db);
        }
      });
    });
  }

  public  async openDb(path: string) {
    return new Promise<sqlite3.Database>((resolve, reject) => {
      const db = new sqlite3.Database(
        path,
        sqlite3.OPEN_READWRITE,
        (err: any) => {
          if (err) {
            log.error(err);
            reject(err);
          }
          db.run('PRAGMA journal_mode = WAL;');
          db.run('PRAGMA synchronous = OFF');
          db.run('PRAGMA foreign_keys = ON;');
          resolve(db);
        }
      );
    });
  }


}
