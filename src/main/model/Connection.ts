import sqlite3 from 'sqlite3';
import log from 'electron-log';

export class Connection {
  protected dbPath: string;

  public static readonly entityMapper = {};

  private connection: sqlite3.Database;

  constructor(path: string) {
    this.dbPath = path;
  }

  public createDB(): Promise<sqlite3.Database> {
    return new Promise<sqlite3.Database>((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, async (err: any) => {
        if (err) {
          reject(new Error('Unable to create DB'));
        } else {
          this.connection = db;
          await this.connection.close();
          resolve(db);
        }
      });
    });
  }

  public async openDb(mode: number = sqlite3.OPEN_READWRITE): Promise<sqlite3.Database> {
    return new Promise<sqlite3.Database>((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, mode, (err: any) => {
        if (err) {
          log.error(err);
          reject(err);
        }
        // db.run('PRAGMA journal_mode = WAL;');
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
