/* eslint-disable no-async-promise-executor */
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
          db.exec(query.SQL_DB_TABLES,async () => {    
            db.close();
            await this.createViews();
            resolve(true);
          });
        }
      });
    });
  }

  public open(path :string): Promise<any> {
    return new Promise((resolve, reject) => {
      const db: any = new sqlite3.Database(
        path,
        sqlite3.OPEN_READWRITE,
        (err: any) => {
          if (err) {
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

  public openDb(): Promise<any> {
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
          db.run('PRAGMA foreign_keys = ON;');
          resolve(db);
        }
      );
    });
  }

  private createViews() {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.run("begin transaction");
          db.run(
            'CREATE VIEW IF NOT EXISTS components (id,name,version,purl,url,source) AS SELECT comp.id AS compid ,comp.name,comp.version,comp.purl,comp.url,comp.source FROM component_versions AS comp LEFT JOIN license_component_version lcv ON comp.id=lcv.cvid;'
          );
          db.run(
            'CREATE VIEW IF NOT EXISTS license_view (cvid,name,spdxid,url,license_id) AS SELECT lcv.cvid,lic.name,lic.spdxid,lic.url,lic.id FROM license_component_version AS lcv LEFT JOIN licenses AS lic ON lcv.licid=lic.id;'
          );

          db.run(`
            CREATE VIEW IF NOT EXISTS summary AS SELECT component_versions.id AS compid,component_versions.purl,component_versions.version,SUM(results.ignored ) AS ignored , SUM(results.identified) AS identified , 
            SUM(identified=0 AND ignored=0) AS pending
            FROM results 
            INNER JOIN component_versions ON component_versions.purl=results.purl
            AND component_versions.version=results.version
            GROUP BY results.purl, results.version 
            ORDER BY compid ASC;         
          `)
          db.run('commit',(err)=>{
            db.close();
            if(err)resolve(false)
            else resolve(true);
          });         
        });
      } catch (error) {
        console.log(error);
      }
    });
  }
}
