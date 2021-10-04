import sqlite3 from 'sqlite3';

import fs from 'fs';

import { Querys } from '../../db/querys_db';
import { workspace } from '../../workspace/Workspace';

export class ExportModel {
  private db: sqlite3;

  private query: Querys;

  constructor() {
    this.db = new sqlite3.Database(`${workspace.getOpenedProjects()[0].getMyPath()}/scan_db`, sqlite3.OPEN_READWRITE);
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
    return workspace.getOpenedProjects()[0].getResults();
  }

  public async getWfpData(): Promise<string> {
    const data: string = await fs.promises.readFile(
      `${workspace.getOpenedProjects()[0].getMyPath()}/winnowing.wfp`,
      'utf-8'
    );
    return data;
  }
}
