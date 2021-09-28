import sqlite3 from 'sqlite3';

import { defaultProject } from '../../workspace/ProjectTree';

import { Querys } from '../../db/querys_db';

export class ExportModel {
    
  private db: sqlite3;

  private query;

  constructor() {
    this.db = new sqlite3.Database(`${defaultProject.work_root}/scan_db`, sqlite3.OPEN_READWRITE);
    this.db.run('PRAGMA journal_mode = WAL;');
    this.db.run('PRAGMA synchronous = OFF');
    this.db.run('PRAGMA foreign_keys = ON;');
    this.query = new Querys();
  }

  public getSpdxData() {
    return new Promise<any>((resolve, reject) => {
      try {
        this.db.all(this.query.SQL_GET_SPDX_COMP_DATA, async (err: any, data: any) => {
          this.db.close();
          if (err) throw err;
          else resolve(data);
        });
      } catch (error) {
        reject(error);
      }
    });
  }


}
