/* eslint-disable prettier/prettier */
/* eslint-disable func-names */
import sqlite3 from 'sqlite3';
import fs from 'fs';

import { Querys } from './querys_db';

const query = new Querys();

export class Db {
  dbPath: string;

  constructor(path: string) {
    this.dbPath = `${path}/scan_db`;
  }

  // CALL THIS FUCTION TO INIT THE DB
  async init() {
    try {
      const success = await this.scanCreateDb();
      if (success) return true;
    } catch (error) {
      return error;
    }
    return false;
  }

  // CREATE A NEW SCAN DB
  private scanCreateDb() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (err: any) => {
        if (err) {
          reject(new Error('Unable to create DB'));
        } else {
          db.exec(query.SQL_DB_TABLES, () => {
            db.close();
            resolve(true);
          });
        }
      });
    });
  }

  protected openDb(): Promise<any> {
    return new Promise((resolve, reject) => {
      const db: any = new sqlite3.Database(
        this.dbPath,
        sqlite3.OPEN_READWRITE,
        (err: any) => {
          if (err) {
            reject(err);
          }
          db.run('PRAGMA journal_mode = WAL;');
          db.run('PRAGMA synchronous = OFF');
          resolve(db);
        }
      );
    });
  }
}
