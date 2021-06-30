/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable object-shorthand */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */

import { TramTwoTone } from '@material-ui/icons';
import sqlite3 from 'sqlite3';
import { UtilsDb } from './utils_db';

const utilsDb = new UtilsDb();

/** SQL CREATE SCAN TABLES * */

const SQL_CREATE_TABLE_FILES =
  'CREATE TABLE IF NOT EXISTS files (md5 text primary key, path text unique not null, pid integer, scanned integer default 0, identified integer default 0,reviewed integer default 0, open_source integer default 0);';
const SQL_CREATE_TABLE_RESULTS =
  'CREATE TABLE IF NOT EXISTS results (id integer primary key asc,md5_file text, fileid integer, vendor text, component text, version text, latest_version text, cpe text, license text, url text, lines text, oss_lines text, matched text, filename text, size text, idtype text, md5_comp text,compid integer,purl text);';
const SQL_CREATE_TABLE_FILE_INVENTORIES =
  'CREATE TABLE IF NOT EXISTS file_inventories (id integer primary key asc, path text, inventoryid integer not null);';
const SQL_CREATE_TABLE_INVENTORY =
  'CREATE TABLE IF NOT EXISTS inventories (id integer primary key,version text not null ,compid integer not null,purl text, usage text, notes text, url text, license_name text);';
const SQL_CREATE_TABLE_STATUS =
  'CREATE TABLE IF NOT EXISTS status (files integer, scanned integer default 0, status text, project integer, user text, message text, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, type text, size text);';
const COMPDB_SQL_CREATE_TABLE_COMPVERS =
  'CREATE TABLE IF NOT EXISTS component_versions (id integer primary key asc, comp_name text, version text not null, description text, url text, purl text, license text, UNIQUE(comp_name, version,description,url,purl,license));';
const COMPDB_SQL_CREATE_TABLE_LICENCES_FOR_COMPVERS =
  'CREATE TABLE IF NOT EXISTS license_component_version (id integer primary key asc, cvid integer not null, licid integer not null, unique(cvid,licid));';
const COMPDB_LICENSES_TABLE =
  "CREATE TABLE IF NOT EXISTS licenses (id integer primary key asc, spdxid text default '', name text not null, fulltext text default '', url text default '', unique(spdxid,name));";

/** SQL SCAN INSERT* */
// SQL INSERT RESULTS
const SQL_INSERT_RESULTS =
  'INSERT or IGNORE INTO results (md5_file,vendor,component,version,latest_version,license,url,lines,oss_lines,matched,filename,idtype,md5_comp,purl) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
const SQL_INSERT_FILES =
  'INSERT or IGNORE INTO files (md5, pid, scanned, path) values (?, ?, ?,?);';
// SQL NEW INVENTORY
const SQL_SCAN_INVENTORY_INSERT =
  'INSERT INTO inventories (compid,version ,purl ,usage, notes, url, license_name) values (?,?,?,?,?,?,?);';
// SQL INSERT FILE INVENTORIES
const SQL_INSERT_FILE_INVENTORIES =
  'INSERT into file_inventories (path,inventoryid) values (?,?);';

/** SQL COMPONENTS TABLES INSERT* */
// SQL INSERT INTO LICENSES
const COMPDB_LICENSES_INSERT =
  'INSERT OR IGNORE INTO licenses (spdxid,name,fulltext,url) VALUES(?,?,?,?);';
// SQL INSERT INTO  COMPONENT VERSIONS
const COMPDB_SQL_COMP_VERSION_INSERT =
  'INSERT OR IGNORE INTO component_versions  (comp_name,version, description, url,purl,license) values (?,?,?,?,?,?);';
// ATTACH A COMPONENT TO A LICENSE
const SQL_LICENSE_ATTACH_TO_COMPONENT_BY_ID =
  'INSERT or IGNORE INTO license_component_version (cvid,licid) values (?,?)';
const SQL_ATTACH_LICENSE_BY_PURL_NAME =
  'INSERT or IGNORE INTO license_component_version (cvid,licid) values ((SELECT id FROM component_versions where purl=? and version=?),(SELECT id FROM licenses where name=?));';

const SQL_ATTACH_LICENSE_PURL_SPDXID =
  'INSERT or IGNORE INTO license_component_version (cvid,licid) values ((SELECT id FROM component_versions where purl=? and version=?),(SELECT id FROM licenses where spdxid=?));';

/** SQL SCAN SUMMARY* */
const SQL_SCAN_COUNT_RESULT_FILTER =
  "SELECT COUNT(*) as filtered from (select results.id from results inner join files on results.md5_file=files.md5 where url is not null and results.url != '' and files.path like ?);";
const SQL_SCAN_COUNT_REVIEWED_FILTER =
  'SELECT COUNT (*)  as reviewed from (select md5 from files where files.reviewed>0 and files.path like ?);';
const SQL_SCAN_COUNT_OPENSOURCE_FILTER =
  'SELECT COUNT (*) openSource from (select md5 from files where files.open_source>0 and files.path like ? );';
const SQL_SCAN_COUNT_IDENTIFIED_FILTER =
  'SELECT COUNT (*) identified from (select md5 from files where files.identified>0 and files.path like ? );';

/** *** SQL SCAN GET * **** */
const SQL_SCAN_SELECT_INVENTORIES_FROM_PATH =
  'SELECT i.id, i.compid,i.usage,i.notes,i.url,i.license_name from inventories i, file_inventories fi where i.id=fi.inventoryid and fi.path like ?;';
const SQL_SCAN_SELECT_INVENTORIES_FROM_PURL =
  'SELECT i.id,i.compid,i.usage,i.notes,i.url,i.license_name from inventories i where i.purl=? and i.version=?;';
const SQL_SCAN_SELECT_FILE_RESULTS =
  'SELECT path,compid,lines,oss_lines,matched,filename,size,idtype,md5_file,md5_comp,purl from results inner join files on results.md5_file=files.md5 where path like ? and files.scanned!=0 order by path;';
// GET ALL THE INVENTORIES ATTACHED TO A COMPONENT
const SQL_SELECT_ALL_INVENTORIES_ATTACHED_TO_COMPONENT =
  'SELECT i.id,i.usage,i.purl,i.notes,i.url,i.license_name from inventories i, component_versions cv where i.purl=cv.purl and i.version=cv.version and cv.purl=? and cv.version=?;';
// GET ALL THE INVENTORIES ATTACHED TO A FILE
const SQL_SELECT_ALL_INVENTORIES_FROM_FILE =
  'SELECT i.id,i.usage,i.notes,i.purl,i.version,i.license_name,i.url FROM inventories i, file_inventories fi where i.id=fi.inventoryid and fi.path=?;';

// SQL_GET_COMPONENTS TABLE
const SQL_GET_COMPONENT =
  'SELECT id,comp_name,version,description,url,purl,license from component_versions where purl like ?';

const SQL_GET_COMPONENT_BY_ID =
  'SELECT cv.comp_name as name,cv.id as compid,cv.purl,cv.url,cv.version from component_versions cv where cv.id=?;';

const SQL_GET_LICENSES_BY_COMPONENT_ID =
  'SELECT l.id,l.name,l.spdxid FROM licenses l where l.id in (SELECT lcv.licid from license_component_version lcv where lcv.cvid=?);';

const SQL_GET_COMPV_LICENSE_BY_COMPID =
  'SELECT li.name,li.id,li.spdxid from licenses li where li.id in (SELECT cvl.licid from license_component_version cvl where cvl.cvid=?);';
const SQL_GET_COMPID_FROM_PURL =
  'SELECT id from component_versions where purl like ? and version like ?;';
// GET LICENSES
const COMPDB_SQL_LICENSE_ALL =
  'SELECT id, spdxid, name, url from licenses where id like ? ;';
// GET LICENSE ID BY NAME OR SPDXID
const COMPDB_SQL_GET_LICENSE_ID_FROM_SPDX_NAME =
  'SELECT id from licenses where licenses.name=? or licenses.spdxid=?;';

export class Scan {
  dbPath: string;

  component: any;

  lastID: any;

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
          db.run(SQL_CREATE_TABLE_FILES);
          db.run(SQL_CREATE_TABLE_RESULTS);
          db.run(SQL_CREATE_TABLE_FILE_INVENTORIES);
          db.run(SQL_CREATE_TABLE_INVENTORY);
          db.run(SQL_CREATE_TABLE_STATUS);
          db.run(COMPDB_SQL_CREATE_TABLE_COMPVERS);
          db.run(COMPDB_SQL_CREATE_TABLE_LICENCES_FOR_COMPVERS);
          db.run(COMPDB_LICENSES_TABLE);
          db.close();
        }
        resolve(true);
      });
    });
  }

  private openDb(): Promise<any> {
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

  // INSERT FILES
  private insertFile(stmt: any, data: any, filePath: string) {
    stmt.run(data.file_hash, 0, 'n/a', filePath);
  }

  insertFiles(resultPath: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const result: object = await utilsDb.readFile(resultPath);
        const db: any = await this.openDb();
        const stmt = db.prepare(SQL_INSERT_FILES);
        let data: any;
        let filePath: string;
        for (const [key, value] of Object.entries(result)) {
          for (let i = 0; i < value.length; i = +1) {
            filePath = key;
            data = value[i];
            this.insertFile(stmt, data, filePath);
          }
        }
        stmt.finalize();
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  // INSERT RESULTS
  async insertResults(resultPath: string) {
    try {
      const result: Record<any, any> = await utilsDb.readFile(resultPath);
      const db = await this.openDb();
      let data: any;
      for (const [key, value] of Object.entries(result)) {
        for (let i = 0; i < value.length; i += 1) {
          data = value[i];
          if (data.id !== 'none') {
            await this.insertResult(db, data);
          }
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  private insertResult(db: any, data: any) {
    return new Promise(async (resolve) => {
      const stmt = db.prepare(SQL_INSERT_RESULTS);
      db.serialize(function () {
        const licenseName =
          data.licenses && data.licenses[0] ? data.licenses[0].name : 'n/a';
        stmt.run(
          data.file_hash,
          data.vendor,
          data.component,
          data.version,
          data.latest,
          licenseName,
          data.url,
          data.lines,
          data.oss_lines,
          data.matched,
          data.file,
          data.id,
          data.url_hash,
          data.purl ? data.purl[0] : ' '
        );
      });
      stmt.finalize();
      resolve(true);
    });
  }

  // CONVERT ARRAY TO RESULTS FORMAT
  convertToResultsFormat(input: any) {
    return new Promise((resolve, reject) => {
      if (input === undefined || input.length === 0) {
        reject(new Error('input is empty'));
      }
      const formattedData = {};
      for (let i = 0; i < input.length; i += 1) {
        for (const obj of input[i]) {
          const newKey = obj.path;
          formattedData[newKey] = [];
          delete obj.path;
          formattedData[newKey].push(obj);
        }
      }
      resolve(formattedData);
    });
  }

  // GET RESULT
  private async getResult(path: string) {
    const db = await this.openDb();
    return new Promise<any>(async (resolve, reject) => {
      db.all(
        SQL_SCAN_SELECT_FILE_RESULTS,
        `%${path}`,
        (err: any, data: any) => {
          if (data === !null) {
            resolve(data);
          } else {
            reject(err);
          }
        }
      );
    });
  }

  // GET RESULTS
  async getResults(paths: any) {
    const results: any[] = [];
    return new Promise<any[]>(async (resolve, reject) => {
      // const db:any = await this.db;
      for (const path of paths.files) {
        const result: any = await this.getResult(path.path);
        if (results) results.push(result);
        else reject(new Error('{}'));
      }
      resolve(results);
    });
  }

  // CREATE NEW FILE INVENTORY
  async newFileInventory(newInventory: any, invId: number) {
    const db = await this.openDb();
    for (const path of newInventory.files) {
      db.run(SQL_INSERT_FILE_INVENTORIES, path, invId);
    }
  }

  // NEW INVENTORY
  async createInventory(inventory: any) {
    const self = this;
    const db = await this.openDb();
    return new Promise<number>(async (resolve, reject) => {
      db.run(
        SQL_SCAN_INVENTORY_INSERT,
        inventory.compid ? inventory.compid : 0,
        inventory.version,
        inventory.purl,
        inventory.usage ? inventory.usage : 'n/a',
        inventory.notes ? inventory.notes : 'n/a',
        inventory.url ? inventory.url : 'n/a',
        inventory.license_name ? inventory.license_name : 'n/a',
        async function (this: any, err: any) {
          await self.newFileInventory(inventory, this.lastID);
          if (err) {
            reject(new Error(err));
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  private getInventoryByFilePath(path: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.run(
          SQL_SCAN_SELECT_INVENTORIES_FROM_PATH,
          path,
          (err: object, data: any) => {
            db.close();
            if (err) resolve(undefined);
            else resolve(data);
          }
        );
      } catch (error) {
        reject(new Error('The inventory does not exists'));
      }
    });
  }

  private getInventoryByPurlVersion(inventory: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(
          SQL_SCAN_SELECT_INVENTORIES_FROM_PURL,
          inventory.purl,
          inventory.version,
          (err: object, inv: any) => {
            if (err) resolve(undefined);
            else resolve(inv);
          }
        );
      } catch (error) {
        reject(new Error('The inventory does not exists'));
      }
    });
  }

  // GET INVENTORIES
  getInventory(inventory: any) {
    return new Promise(async (resolve, reject) => {
      try {
        let inventories: any;
        if (inventory.path) {
          inventories = await this.getInventoryByFilePath(inventory.path);
        } else {
          inventories = await this.getInventoryByPurlVersion(inventory);
        }

        if (inventories !== undefined) {
          const comp = await this.getComponent(inventory);
          inventories[0].component = comp;
          resolve(inventories);
        } else {
          reject(new Error('error'));
        }
      } catch (error) {
        reject(new Error('error'));
      }
    });
  }

  private getFiltered(db: any, path: string) {
    return new Promise<any[]>((resolve, reject) => {
      db.each(
        query.SQL_SCAN_COUNT_RESULT_FILTER,
        `${path}%`,
        (err: object, filtered: []) => {
          if (!err) resolve(filtered);
          else reject(new Error('{}'));
        }
      );
    });
  }

  private getOpenSource(db: any, path: string) {
    return new Promise<any[]>((resolve, reject) => {
      db.each(
        query.SQL_SCAN_COUNT_OPENSOURCE_FILTER,
        path,
        (err: any, openSource: []) => {
          if (!err) resolve(openSource);
          else reject(err);
        }
      );
    });
  }

  private getReviewed(db: any, path: string) {
    return new Promise<any[]>((resolve, reject) => {
      db.each(
        query.SQL_SCAN_COUNT_REVIEWED_FILTER,
        path,
        (err: any, reviewed: []) => {
          if (!err) resolve(reviewed);
          else reject(err);
        }
      );
    });
  }

  private getIdentified(db: any, path: string) {
    return new Promise<any[]>((resolve, reject) => {
      db.each(
        query.SQL_SCAN_COUNT_IDENTIFIED_FILTER,
        path,
        (err: any, identified: []) => {
          if (!err) resolve(identified);
          else reject(err);
        }
      );
    });
  }

  // GET SCAN SUMMARY
  getSummary(files: any) {
    const summary: any = {
      summary: [],
    };

    return new Promise<any>(async (resolve) => {
      const db = await this.openDb();
      for (const path of files.paths) {
        const filtered: any[] = await this.getFiltered(db, path.path);
        const openSource: any[] = await this.getOpenSource(db, path.path);
        const reviewed: any[] = await this.getReviewed(db, path.path);
        const identified: any[] = await this.getIdentified(db, path.path);
        summary.summary.push(filtered);
        summary.summary.push(openSource);
        summary.summary.push(reviewed);
        summary.summary.push(identified);
      }
      resolve(summary);
    });
  }
}
