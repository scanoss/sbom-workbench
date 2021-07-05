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
  "SELECT COUNT(*) as filtered from (select results.id from results inner join files on results.md5_file=files.md5 where url is not null and url != '' and files.path like ?);";
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
  'SELECT id,compid,usage,notes,url,license_name from inventories where purl like ?;';
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
// const SQL_GET_COMPONENT_VERSION = 'SELECT cv.id as compid,cv.purl,cv.version,cv.url,l.name as license_name,l.id,l.spdxid as license_spdxid from component_versions cv LEFT JOIN license_component_version lcv on lcv.cvid=cv.id LEFT JOIN licenses l on l.id=lcv.licid where cv.id=?;';

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

  private async insertResult(db: any, data: any) {
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

  // GET INVENTORIES
  getInventory(inventory: any) {
    const filter = this.inventoryFilter(inventory);
    return new Promise(async (resolve, reject) => {
      const db = await this.openDb();
      db.all(filter.query, `%${filter.key}`, async (err: object, data: any) => {
        // db.close();
        if (!err) {
          for (let i = 0; i < data.length; i += 1) {
            const comp = await this.getComponent(inventory);
            data[i].component = comp;
          }
          resolve(data);
          db.close();
        } else {
          reject(new Error('{}'));
        }
      });
    });
  }

  private getFiltered(db: any, path: string) {
    return new Promise<any[]>((resolve, reject) => {
      db.each(
        SQL_SCAN_COUNT_RESULT_FILTER,
        path,
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
        SQL_SCAN_COUNT_OPENSOURCE_FILTER,
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
        SQL_SCAN_COUNT_REVIEWED_FILTER,
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
        SQL_SCAN_COUNT_IDENTIFIED_FILTER,
        path,
        (err: any, identified: []) => {
          if (!err) resolve(identified);
          else reject(err);
        }
      );
    });
  }

  // GET SCAN SUMMARY
  async getSummary(paths: any) {
    const summary: any = {
      summary: [],
    };
    const db = await this.openDb();
    return new Promise<any>(async (resolve) => {
      for (const file of paths.files) {
        const filtered: any[] = await this.getFiltered(db, file.path);
        const openSource: any[] = await this.getOpenSource(db, file.path);
        const reviewed: any[] = await this.getReviewed(db, file.path);
        const identified: any[] = await this.getIdentified(db, file.path);
        summary.summary.push(filtered);
        summary.summary.push(openSource);
        summary.summary.push(reviewed);
        summary.summary.push(identified);
      }
      resolve(summary);
    });
  }

  // INSERT LICENSES FROM A FILE
  importLicensesFromFile(path: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const json: Record<any, any> = await utilsDb.readFile(path);
        for (const [key, license] of Object.entries(json)) {
          db.run(
            COMPDB_LICENSES_INSERT,
            license.spdxid,
            license.name,
            license.fulltext,
            license.url,
            (err: any) => {
              if (err) reject(new Error('Unable to insert licenses'));
            }
          );
        }
        db.close();
        resolve(true);
      } catch (error) {
        reject(new Error('unable to insert licenses'));
      }
    });
  }

  importLicensesFromJSON(json: Record<any, any>) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          for (const [key, license] of Object.entries(json)) {
            db.run(
              COMPDB_LICENSES_INSERT,
              license.spdxid,
              license.name,
              license.fulltext,
              license.url
            );
          }
          db.close();
        });
        resolve(true);
      } catch (error) {
        reject(new Error('Unable to insert licenses'));
      }
    });
  }

  // CREATE LICENSE
  createLicense(license: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const stmt = db.prepare(COMPDB_LICENSES_INSERT);
        stmt.run(
          license.spdxid,
          license.name,
          license.fulltext,
          license.url,
          function (this: any, err: any) {
            db.close();
            if (err || this.lastID === 0)
              reject(new Error('The license was not created or already exist'));
            license.id = this.lastID;
            stmt.finalize();
            resolve(license);
          }
        );
      } catch (error) {
        reject(new Error('The license was not created'));
      }
    });
  }

  // GET COMPONENT
  async getComponent(data: any) {
    const self = this;
    const db = await this.openDb();
    return new Promise<any[]>((resolve, reject) => {
      db.get(
        SQL_GET_COMPONENT,
        data.purl,
        async function (err: any, comp: any) {
          db.close();
          const compid = await self.getComponentIdFromPurl(data);
          if (compid !== undefined) {
            const license = await self.getLicensesVersionById(compid);
            comp.licenses = license;
          }
          if (err) reject(new Error('[]'));
          else resolve(comp);
        }
      );
    });
  }

  // COMPONENT NEW
  private componentNewImportFromResults(db: any, data: any) {
    return new Promise(async (resolve, reject) => {
      db.serialize(function () {
        const stmt = db.prepare(COMPDB_SQL_COMP_VERSION_INSERT);
        const licenseName =
          data.licenses && data.licenses[0] ? data.licenses[0].name : 'n/a';
        stmt.run(
          data.component,
          data.version,
          'AUTOMATIC IMPORT',
          data.url,
          data.purl ? data.purl[0] : 'n/a',
          licenseName,
          (err: any) => {
            if (err) reject(new Error('error'));
          }
        );
        stmt.finalize();
        resolve(true);
      });
    });
  }

  // IMPORT UNIQUE RESULTS TO COMP DB FROM FILE
  importUniqueFromScanResultsFile(resultPath: string) {
    let data: any;
    return new Promise(async (resolve, reject) => {
      try {
        const result: Record<any, any> = await utilsDb.readFile(resultPath);
        const db = await this.openDb();
        for (const [key, value] of Object.entries(result)) {
          for (let i = 0; i < value.length; i += 1) {
            data = value[i];
            if (data.id !== 'none') {
              await this.componentNewImportFromResults(db, data);
            }
          }
        }
        db.close();
      } catch (error) {
        reject(new Error('Unable to import scan results'));
      }
      resolve(true);
    });
  }

  // IMPORT UNIQUE RESULTS TO COMP DB FROM JSON
  importUniqueFromScanResultsJson(json: string) {
    let data: any;
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const result: Record<any, any> = await utilsDb.readFile(json);
        for (const [key, value] of Object.entries(result)) {
          for (let i = 0; i < value.length; i += 1) {
            data = value[i];

            if (data.id !== 'none') {
              await this.componentNewImportFromResults(db, data);
            }
          }
        }
        db.close();
      } catch (error) {
        reject(new Error('Unable to import results'));
      }
      resolve(true);
    });
  }

  // GET LICENSES
  getLicenses(license: any) {
    let id: any;
    return new Promise(async (resolve, reject) => {
      try {
        //
        if (license.license_id) id = license.id;
        else id = await this.getLicenseIdFilter(license);
        if (id === undefined) {
          id = '%';
        }
        const db = await this.openDb();
        db.serialize(function () {
          db.all(COMPDB_SQL_LICENSE_ALL, `${id}`, (err: any, licenses: any) => {
            if (err) reject(new Error('[]'));
            else resolve(licenses);
          });
        });
        db.close();
      } catch (error) {
        reject(new Error('[]'));
      }
    });
  }

  // Attach license to component version by id
  private attachLicensebyId(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const stmt = db.prepare(SQL_LICENSE_ATTACH_TO_COMPONENT_BY_ID);
        stmt.run(data.compid, data.license_id, (err: any) => {
          if (err) reject(new Error('License was not attached'));
          db.close();
          stmt.finalize();
          resolve(true);
        });
      } catch (err) {
        reject(new Error('License was not attached'));
      }
    });
  }

  // Attach license to component version by license name and purl
  private attachLicenseByPurlLicenseName(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const stmt = db.prepare(SQL_ATTACH_LICENSE_BY_PURL_NAME);
        stmt.run(data.purl, data.version, data.license_name, (err: any) => {
          if (err) reject(new Error('License was not attached'));
          db.close();
          stmt.finalize();
          resolve(true);
        });
      } catch (err) {
        reject(new Error('License was not attached'));
      }
    });
  }

  // Attach license to component version by license spdxid and purl
  private attachLicenseByPurlSpdxid(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const stmt = db.prepare(SQL_ATTACH_LICENSE_PURL_SPDXID);
        stmt.run(data.purl, data.version, data.license_spdxid, (err: any) => {
          if (err) reject(new Error('License was not attached'));
          db.close();
          stmt.finalize();
          resolve(true);
        });
      } catch (err) {
        reject(new Error('License was not attached'));
      }
    });
  }

  // ATTACH LICENSE TO A COMPONENT VERSION
  licenseAttach(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        if (data.license_id && data.compid) {
          const success = await this.attachLicensebyId(data);
          if (success) resolve(true);
        }

        if (data.purl && data.license_name) {
          const success = await this.attachLicenseByPurlLicenseName(data);
          if (success) resolve(true);
        } else {
          const success = await this.attachLicenseByPurlSpdxid(data);
          if (success) resolve(true);
        }
      } catch (error) {
        reject(new Error('License not attached'));
      }
    });
  }

  // GET COMPONENT VERSIONS
  getComponentById(id: number) {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.all(
            SQL_GET_COMPONENT_BY_ID,
            `${id}`,
            async function (err: any, data: any) {
              db.close();
              if (err) reject(new Error('[]'));
              else {
                const licenses = await self.getAllLicensesFromComponentId(
                  data[0].compid
                );
                data[0].licenses = licenses;
                resolve(data);
              }
            }
          );
        });
      } catch (error) {
        reject(new Error('[]'));
      }
    });
  }

  // GET LICENSE BY ATTACHED TO A COMPONENT
  private getAllLicensesFromComponentId(id: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.all(
            SQL_GET_LICENSES_BY_COMPONENT_ID,
            `${id}`,
            (err: any, data: any) => {
              db.close();
              if (err) resolve('[]');
              else resolve(data);
            }
          );
        });
      } catch (error) {
        reject(new Error('[]'));
      }
    });
  }

  // GET ALL THE INVENTORIES ATTACHED TO A COMPONENT
  getAllInventoriesFromComponent(component: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.all(
            SQL_SELECT_ALL_INVENTORIES_ATTACHED_TO_COMPONENT,
            `${component.purl}`,
            `${component.version}`,
            (err: any, data: any) => {
              db.close();
              if (err) reject(new Error('[]'));
              else resolve(data);
            }
          );
        });
      } catch (error) {
        reject(new Error('[]'));
      }
    });
  }

  // GET ALL THE INVENTORIES ATTACHED TO A FILE
  getAllInventoriesFromFile(inventory: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.all(
            SQL_SELECT_ALL_INVENTORIES_FROM_FILE,
            `${inventory.file}`,
            (err: any, data: any) => {
              db.close();
              if (err) reject(new Error('[]'));
              else resolve(data);
            }
          );
        });
      } catch (error) {
        reject(new Error('[]'));
      }
    });
  }

  // CREATE COMPONENT
  createComponent(component: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const stmt = db.prepare(COMPDB_SQL_COMP_VERSION_INSERT);
        db.serialize(function () {
          stmt.run(
            component.name,
            component.version,
            component.description,
            component.url,
            component.purl,
            component.license_name,
            function (this: any, err: any) {
              db.close();
              if (err) reject(new Error('error'));
              resolve(this.lastID);
            }
          );
        });
        stmt.finalize();
      } catch (error) {
        reject(new Error('[]'));
      }
    });
  }

  /** **** * FILTERS ****** */

  /** *LICENSE FILTER** */
  // Filter to perform the query with license name or spdixid
  private licenseNameSpdxidFilter(license: any) {
    const filter = {
      name: null,
      spdxid: null,
    };
    if (license.license_name) {
      filter.name = license.license_name;
      filter.spdxid = null;
    } else if (license.license_spdxid) {
      filter.name = null;
      filter.spdxid = license.license_spdxid;
    }
    return filter;
  }

  // GET LICENSE ID FROM SPDXID OR LICENSE NAME
  private async getLicenseIdFilter(license: any) {
    return new Promise<number>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const filter = this.licenseNameSpdxidFilter(license);
        if (filter.name == null && filter.spdxid == null) {
          resolve(0);
        }
        db.serialize(function () {
          db.all(
            COMPDB_SQL_GET_LICENSE_ID_FROM_SPDX_NAME,
            `${filter.name}`,
            `${filter.spdxid}`,
            (err: any, lic: any) => {
              db.close();
              if (err) reject(new Error(undefined));
              else resolve(lic[0].id);
            }
          );
        });
      } catch (error) {
        reject(new Error(undefined));
      }
    });
  }

  // GET LICENSES BY COMPONENT ID
  private getLicensesVersionById(cvId: number) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.all(
            SQL_GET_COMPV_LICENSE_BY_COMPID,
            `${cvId}`,
            (err: any, data: any) => {
              db.close();
              if (err) {
                reject(new Error('[]'));
              } else {
                resolve(data);
              }
            }
          );
        });
      } catch (error) {
        reject(new Error('[]'));
      }
    });
  }

  /** *COMPONENT FILTER** */
  // GET COMPONENENT ID FROM PURL
  private getComponentIdFromPurl(data: any) {
    return new Promise<number>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.get(
          SQL_GET_COMPID_FROM_PURL,
          data.purl,
          data.version,
          (err: any, component: any) => {
            db.close();
            if (err) reject(new Error(undefined));
            resolve(component.id);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /** *INVENTORY'S FILTER** */
  // Filter for get inventory id by path or purls
  private inventoryFilter(data: any) {
    let query: string;
    let key: string;
    // If we have the path
    if (data.path) {
      key = data.path;
      query = SQL_SCAN_SELECT_INVENTORIES_FROM_PATH;
    } else {
      key = data.purl;
      query = SQL_SCAN_SELECT_INVENTORIES_FROM_PURL;
    }
    return {
      query: query,
      key: key,
    };
  }
}
