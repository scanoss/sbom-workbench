import log from 'electron-log';
import { LicenseDTO, NewLicenseDTO } from '@api/dto';
import { Querys } from './querys_db';
import { Model } from './Model';
import { License } from '../../api/types';
import { IComponentLicense } from './interfaces/component/IComponentLicense';
import { License as LicenseORM } from './ORModel/License';
import { toEntity } from '../adapters/modelAdapter';

const query = new Querys();

export class LicenseModel extends Model {
  public constructor(path: string) {
    super(path);
  }

  public bulkCreate(db: any, license: Partial<License>) {
    return new Promise<number>((resolve, reject) => {
      try {
        db.serialize(async function () {
          db.run(query.SQL_CREATE_LICENSE, license.spdxid, license.name, license.fulltext, license.url, 1);
          db.get(`${query.SQL_SELECT_LICENSE}spdxid=?;`, license.spdxid, (err: any, data: any) => {
            if (err) throw err;
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
  public create(license: NewLicenseDTO) {
    return new Promise<Partial<LicenseDTO>>(async (resolve, reject) => {
      const db = await this.openDb();
      db.serialize(async function () {
        db.run('begin transaction');
        db.run(query.SQL_CREATE_LICENSE, license.spdxid, license.name, license.fulltext, license.url, 0);
        db.run('commit', function (this: any, err: any) {
          db.close();
          if (err || this.lastID === 0) reject(err !== null ? err : new Error('License already exists'));
          resolve({ id: this.lastID, ...license });
        });
      });
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
  public get(id: number) {
    return new Promise<LicenseDTO>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.get(`${query.SQL_SELECT_LICENSE} id=${id};`, (err: any, license: LicenseDTO) => {
          db.close();
          if (err || license === undefined) throw new Error('Unable to get license ');
          resolve(license);
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  // GET LICENSE
  public getAll() {
    return new Promise<Array<LicenseDTO>>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.all(query.SQL_SELECT_ALL_LICENSES, (err: any, license: Array<LicenseDTO>) => {
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

  public async bulkAttachComponentLicense(data: Array<IComponentLicense>) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        let licenses: any = await LicenseORM.findAll();
        licenses = toEntity<Array<License>>(licenses);
        licenses = licenses.reduce((acc, act) => {
          const { spdxid, fulltext, url , name } = act;
          if (!acc[act.spdxid]) acc[act.spdxid] = {spdxid,fulltext,url,name};
          return acc;
        }, {});
        const db = await this.openDb();
        db.serialize(async () => {
          db.run('begin transaction');
          for (const component of data) {
            if (component.license) {
              for (let i = 0; i < component.license.length; i += 1) {
                let licenseId = null;
                if (licenses[component.license[i]] !== undefined) {
                    if(licenses[component.license[i]].id !== undefined) licenseId = licenses[component.license[i]].id;
                    else {
                    licenseId =  await this.bulkCreate(db, {
                        spdxid: licenses[component.license[i]].spdxid,
                        url: licenses[component.license[i]].url,
                        name: licenses[component.license[i]].name,
                        fulltext:licenses[component.license[i]].fulltext
                      });
                      licenses[component.license[i]].id = licenseId;
                    }
                } else {
                  const newLicense = {
                    id: null,
                    spdxid: component.license[i],
                    name:  component.license[i],
                    fulltext : 'AUTOMATIC IMPORT',
                    url : 'AUTOMATIC IMPORT',
                  };
                  licenseId = await this.bulkCreate(db, newLicense);
                  newLicense.id = licenseId;
                  licenses = { ...licenses, newLicense };
                }
                await this.bulkAttachLicensebyId(db, { compid: component.id, license_id: licenseId });
              }
            }
          }
          db.run('commit', (err: any) => {
            db.close();
            if (err) throw err;
            resolve();
          });
        });
      } catch (error: any) {
        reject(error);
      }
    });
  }

  // ATTACH LICENSE TO A COMPONENT VERSION
  public async licenseAttach(data: any): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
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
      try {
        db.run(query.SQL_LICENSE_ATTACH_TO_COMPONENT_BY_ID, data.compid, data.license_id, (err: any) => {
          if (err) log.error(err);
          resolve(true);
        });
      } catch (error: any) {
        reject(error);
      }
    });
  }

  // Attach license to component version by id
  private attachLicensebyId(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          db.run(query.SQL_LICENSE_ATTACH_TO_COMPONENT_BY_ID, data.compid, data.license_id, (err: any) => {
            if (err) throw err;
            db.close();
            resolve(true);
          });
        });
      } catch (err) {
        log.error(err);
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

  public async getBySpdxId(spdxid: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.get(`${query.SQL_SELECT_LICENSE}spdxid='${spdxid}';`, (err: any, license: any) => {
          db.close();
          if (err) throw err;
          resolve(license);
        });
      } catch (err) {
        log.error(err);
        reject(err);
      }
    });
  }
}
