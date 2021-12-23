/* eslint-disable no-await-in-loop */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-syntax */
import log from 'electron-log';
import { Querys } from './querys_db';
import { Db } from './db';
import { utilDb } from './utils_db';
import { License } from '../../api/types';

const query = new Querys();

export class LicenseDb extends Db {
  constructor(path: string) {
    super(path);
  }

  // CREATE LICENSE
  public bulkCreate(db: any, license: Partial<License>) {
    return new Promise((resolve, reject) => {
      try {
        license.fulltext = 'AUTOMATIC IMPORT';
        license.url = 'AUTOMATIC IMPORT';
        db.serialize(async function () {
          db.run(query.SQL_CREATE_LICENSE, license.spdxid, license.spdxid, license.fulltext, license.url, 1);
          db.get(`${query.SQL_SELECT_LICENSE}spdxid=?;`, license.spdxid, (err: any, data: any) => {
            resolve(data.id);
          });
        });
      } catch (error) {
        log.error(error);
        reject(new Error('The license was not created'));
      }
    });
  }

  // CREATE LICENSE
  public create(license: Partial<License>) {
    return new Promise<License>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(async function () {
          db.run('begin transaction');
          db.run(query.SQL_CREATE_LICENSE, license.spdxid, license.name, license.fulltext, license.url, 0);
          db.run('commit', function (this: any, err: any) {
            db.close();
            if (err || this.lastID === 0) throw new Error('The license was not created or already exist');
            license.id = this.lastID;
            resolve(<License>license);
          });
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  // INSERT LICENSES FROM A FILE
  public importFromFile(path: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const json: Record<any, any> = await utilDb.readFile(path);
        for (const [key, license] of Object.entries(json)) {
          db.run(query.SQL_CREATE_LICENSE, license.spdxid, license.name, license.fulltext, license.url, (err: any) => {
            if (err) throw err;
          });
        }
        db.close();
        resolve(true);
      } catch (error) {
        log.error(error);
        reject(new Error('unable to insert licenses'));
      }
    });
  }

  public importFromJSON(json: Record<any, any>) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.run('begin transaction');
          for (const [key, license] of Object.entries(json)) {
            db.run(query.SQL_CREATE_LICENSE, license.spdxid, license.name, license.fulltext, license.url, 1);
          }
          db.run('commit', (err: any) => {
            if (err) throw err;
            db.close();
            resolve(true);
          });
        });
      } catch (error) {
        log.error(error);
        reject(new Error('Unable to insert licenses'));
      }
    });
  }

  // GET LICENSE
  public get(data: Partial<License>) {
    return new Promise<License>(async (resolve, reject) => {
      try {
        const sqlGet = this.sqlGetLicenseQuery(data);
        const db = await this.openDb();
        db.serialize(function () {
          db.get(sqlGet, (err: any, license: any) => {
            db.close();
            if (err || license === undefined) throw new Error('Unable to get license ');
            resolve(license);
          });
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  private sqlGetLicenseQuery(data: any) {
    let sqlQuery: string;
    if (data.name) sqlQuery = `${query.SQL_SELECT_LICENSE}name='${data.name}';`;
    else if (data.spdxid) sqlQuery = `${query.SQL_SELECT_LICENSE}spdxid='${data.spdxid}';`;
    else sqlQuery = `${query.SQL_SELECT_LICENSE}id=${data.id};`;
    return sqlQuery;
  }

  // GET LICENSE
  public getAll() {
    return new Promise<License>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.all(query.SQL_SELECT_ALL_LICENSES, (err: any, license: any) => {
            db.close();
            if (err) throw new Error('Unable to get all licenses');
            resolve(license);
          });
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  public async bulkAttachComponentLicense(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        let licenses: any = await this.getAll();
        licenses = licenses.reduce((acc, act) => {
          if (!acc[act.spdxid]) acc[act.spdxid] = act.id;
          return acc;
        }, {});
        const db = await this.openDb();
        db.serialize(async () =>{
          db.run('begin transaction');
          for (const component of data) {
            if (component.license) {
              for (let i = 0; i < component.license.length; i += 1) {
                let licenseId = null;
                if (licenses[component.license[i]] !== undefined) {
                  licenseId = licenses[component.license[i]];
                } else {
                  licenseId = await this.bulkCreate(db, {
                    spdxid: component.license[i],
                  });
                  licenses = {
                    ...licenses,
                    [component.license[i]]: licenseId,
                  };
                }
                await this.bulkAttachLicensebyId(db, { compid: component.id, license_id: licenseId });
              }
            }
          }
          db.run('commit', (err: any) => {
            db.close();
            if (err) throw err;
            resolve(true);
          });
        });
      } catch (error: any) {
        reject(error);
      }
    });
  }

  // ATTACH LICENSE TO A COMPONENT VERSION
  public licenseAttach(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        if (data.license_id && data.compid) {
          const success = await this.attachLicensebyId(data);
          if (success) resolve(true);
          return;
        }
        if (data.purl && data.license_name) {
          const success = await this.attachLicenseByPurlLicenseName(data);
          if (success) resolve(true);
        } else {
          const success = await this.attachLicenseByPurlSpdxid(data);
          if (success) resolve(true);
        }
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  public bulkAttachLicensebyId(db: any, data: any) {
    return new Promise(async (resolve, reject) => {
      db.run(query.SQL_LICENSE_ATTACH_TO_COMPONENT_BY_ID, data.compid, data.license_id, (err: any) => {
        if (err) log.error(err);
        resolve(true);
      });
    });
  }

  // Attach license to component version by id
  private attachLicensebyId(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const stmt = db.prepare(query.SQL_LICENSE_ATTACH_TO_COMPONENT_BY_ID);
        stmt.run(data.compid, data.license_id, (err: any) => {
          if (err) reject(new Error('License was not attached'));
          db.close();
          stmt.finalize();
          resolve(true);
        });
      } catch (err) {
        log.error(err);
        reject(err);
      }
    });
  }

  // Attach license to component version by license name and purl
  private attachLicenseByPurlLicenseName(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const stmt = db.prepare(query.SQL_ATTACH_LICENSE_BY_PURL_NAME);
        stmt.run(data.purl, data.version, data.license_name, (err: any) => {
          if (err) reject(new Error('License was not attached'));
          db.close();
          stmt.finalize();
          resolve(true);
        });
      } catch (err) {
        log.error(err);
        reject(err);
      }
    });
  }

  // Attach license to component version by license spdxid and purl
  private attachLicenseByPurlSpdxid(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const stmt = db.prepare(query.SQL_ATTACH_LICENSE_PURL_SPDXID);
        stmt.run(data.purl, data.version, data.license_spdxid, (err: any) => {
          if (err) throw new Error('License was not attached');
          db.close();
          stmt.finalize();
          resolve(true);
        });
      } catch (err) {
        log.error(err);
        reject(err);
      }
    });
  }

  // UPDATE
  update(license: License) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const stmt = db.prepare(query.SQL_CREATE_LICENSE);
        stmt.run(license.spdxid, license.name, license.fulltext, license.url, function (this: any, err: any) {
          db.close();
          if (err || this.lastID === 0) throw new Error('The license was not created or already exist');
          license.id = this.lastID;
          stmt.finalize();
          resolve(license);
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }
}
