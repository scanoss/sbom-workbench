import sqlite3 from 'sqlite3';

import fs from 'fs';

import { Querys } from '../../db/querys_db';

import { defaultProject } from '../../workspace/ProjectTree';

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

  public getCsvData() {
    return new Promise<any>((resolve, reject) => {
      try {
        this.db.all(this.query.SQL_GET_CSV_DATA, async (err: any, data: any) => {
          this.db.close();
          if (err) throw err;
          else resolve(data);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  public getRawData() {
    return defaultProject.results;
  }

  public async getWfpData(): Promise<string> {
    const data: string = await fs.promises.readFile(`${defaultProject.work_root}/winnowing.wfp`, 'utf-8');
    return data;
  }
}
