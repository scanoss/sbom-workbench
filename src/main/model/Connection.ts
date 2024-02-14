import sqlite3 from 'sqlite3';
import log from 'electron-log';

export class Connection {
  protected dbPath: string;

  public static readonly entityMapper = {};

  private connection: sqlite3.Database;

  constructor(path: string) {
    this.dbPath = path;
  }

  public createDB() {
    return new Promise<sqlite3.Database>((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (err: any) => {
        if (err) {
          reject(new Error('Unable to create DB'));
        } else {
          this.connection = db;
          resolve(db);
        }
      });
    });
  }

  public async openDb() {
    return new Promise<sqlite3.Database>((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READWRITE, (err: any) => {
        if (err) {
          log.error(err);
          reject(err);
        }
        db.run('PRAGMA journal_mode = WAL;');
        db.run('PRAGMA synchronous = OFF');
        db.run('PRAGMA foreign_keys = ON;');
        this.connection = db;
        resolve(db);
      });
    });
  }

  public async close() {
    return new Promise<void>((resolve, reject) => {
      this.connection?.close((err: Error) => {
        if (!err) resolve();
        else reject(err);
      });
    });
  }
}
