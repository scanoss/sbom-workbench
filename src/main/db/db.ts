/* eslint-disable prettier/prettier */
/* eslint-disable func-names */
import sqlite3 from 'sqlite3';
import fs from 'fs';



import { Querys } from './querys_db';

const query = new Querys();

export class Db {
  dbPath: string;

  constructor(path:string) { 
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
      const db = new sqlite3.Database(this.dbPath,(err: any) => {
        if (err) {
          reject(new Error('Unable to create DB'));
        } else {
          db.run(query.SQL_CREATE_TABLE_FILES);
          db.run(query.SQL_CREATE_TABLE_RESULTS);
          db.run(query.SQL_CREATE_TABLE_FILE_INVENTORIES);
          db.run(query.SQL_CREATE_TABLE_INVENTORY);
          db.run(query.SQL_CREATE_TABLE_STATUS);
          db.run(query.COMPDB_SQL_CREATE_TABLE_COMPVERS);
          db.run(query.COMPDB_LICENSES_TABLE);
          db.run(query.COMPDB_SQL_CREATE_TABLE_LICENCES_FOR_COMPVERS);       
          db.close();
        }
        resolve(true);
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
