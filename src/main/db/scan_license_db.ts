/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-syntax */
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
    return new Promise<any>((resolve, reject) => {
      try {
        license.fulltext = 'AUTOMATIC IMPORT';
        license.url = 'AUTOMATIC IMPORT';
        db.run(
          query.SQL_CREATE_LICENSE,
          license.spdxid,
          license.spdxid,
          license.fulltext,
          license.url,
          function (this: any) {
            license.id = this.lastID;
            resolve(license);
          }
        );
      } catch (error) {
        reject(new Error('The license was not created'));
      }
    });
  }

  // CREATE LICENSE
  public create(license: License) {
    return new Promise<License>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(async function () {
          db.run('begin transaction');
          db.run(query.SQL_CREATE_LICENSE, license.spdxid, license.name, license.fulltext, license.url);
          db.run('commit', function (this: any, err: any) {
            db.close();
            if (err || this.lastID === 0) reject(new Error('The license was not created or already exist'));
            license.id = this.lastID;
            resolve(license);
          });
        });
      } catch (error) {
        reject(new Error('The license was not created'));
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
            if (err) reject(new Error('Unable to insert licenses'));
          });
        }
        db.close();
        resolve(true);
      } catch (error) {
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
            db.run(query.SQL_CREATE_LICENSE, license.spdxid, license.name, license.fulltext, license.url);
          }
          db.run('commit');
          db.close();
        });
        resolve(true);
      } catch (error) {
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
            if (err || license === undefined) reject(new Error('Unable to get license by id'));
            resolve(license);
          });
        });
      } catch (error) {
        reject(new Error('unable to open db'));
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
            if (err) reject(new Error('Unable to get all licenses'));
            resolve(license);
          });
        });
      } catch (error) {
        reject(new Error('unable to open db'));
      }
    });
  }

  // GET LICENSE ID FROM SPDXID OR LICENSE NAME
  public async getLicenseIdFilter(license: License) {
    return new Promise<number>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const filter = this.licenseNameSpdxidFilter(license);
        if (filter.name == null && filter.spdxid == null) {
          resolve(0);
        }
        db.serialize(function () {
          db.get(
            query.COMPDB_SQL_GET_LICENSE_ID_FROM_SPDX_NAME,
            `${filter.name}`,
            `${filter.spdxid}`,
            (err: any, lic: any) => {
              db.close();
              if (err || lic === undefined) resolve(0);
              else resolve(lic.id);
            }
          );
        });
      } catch (error) {
        reject(new Error(undefined));
      }
    });
  }

  /** *LICENSE FILTER** */
  // Filter to perform the query with license name or spdixid
  private licenseNameSpdxidFilter(license: any) {
    const filter = {
      name: null,
      spdxid: null,
    };
    if (license.name) {
      filter.name = license.name;
      filter.spdxid = null;
    } else if (license.spdxid) {
      filter.name = null;
      filter.spdxid = license.spdxid;
    }
    return filter;
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
        reject(new Error('License not attached'));
      }
    });
  }

  public bulkAttachLicensebyId(db: any, data: any) {
    return new Promise(async (resolve, reject) => {
      db.run(query.SQL_LICENSE_ATTACH_TO_COMPONENT_BY_ID, data.compid, data.license_id, (err: any) => {
        if (err) reject(new Error('License was not attached'));
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
        reject(new Error('License was not attached'));
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
        reject(new Error('License was not attached'));
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

  // UPDATE
  update(license: License) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const stmt = db.prepare(query.SQL_CREATE_LICENSE);
        stmt.run(license.spdxid, license.name, license.fulltext, license.url, function (this: any, err: any) {
          db.close();
          if (err || this.lastID === 0) reject(new Error('The license was not created or already exist'));
          license.id = this.lastID;
          stmt.finalize();
          resolve(license);
        });
      } catch (error) {
        reject(new Error('The license was not created'));
      }
    });
  }
}
