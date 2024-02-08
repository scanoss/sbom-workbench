import log from 'electron-log';
import { LicenseDTO, NewLicenseDTO } from '@api/dto';
import { queries } from '../../querys_db';
import { License } from '@api/types';
import { IComponentLicense } from '../../interfaces/component/IComponentLicense';
import sqlite3 from 'sqlite3';
import { Model } from '../../Model';

export class LicenseModel extends Model {

  private connection: sqlite3.Database
  public constructor(conn: sqlite3.Database) {
    super();
    this.connection = conn;
  }

  public bulkCreate(db: any, license: Partial<License>) {
    return new Promise<number>((resolve, reject) => {
      try {
        license.fulltext = 'AUTOMATIC IMPORT';
        license.url = 'AUTOMATIC IMPORT';
        db.serialize(async function () {
          db.run(queries.SQL_CREATE_LICENSE, license.spdxid, license.spdxid, license.fulltext, license.url, 1);
          db.get(`${queries.SQL_SELECT_LICENSE}spdxid=?;`, license.spdxid, (err: any, data: any) => {
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
    const self = this
    return new Promise<Partial<LicenseDTO>>(async (resolve, reject) => {
      this.connection.serialize(async function () {
        self.connection.run('begin transaction');
        self.connection.run(queries.SQL_CREATE_LICENSE, license.spdxid, license.name, license.fulltext, license.url, 0);
        self.connection.run('commit', function (this: any, err: any) {
          if (err || this.lastID === 0) reject(err !== null ? err : new Error('License already exists'));
          resolve({ id: this.lastID, ...license });
        });
      });
    });
  }

  public importFromJSON(json: Record<any, any>) {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        this.connection.serialize(function () {
          self.connection.run('begin transaction');
          for (const [key, license] of Object.entries(json)) {
            self.connection.run(queries.SQL_CREATE_LICENSE, license.spdxid, license.name, license.fulltext, license.url, 1);
          }
          self.connection.run('commit', (err: any) => {
            if (err) throw err;
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
        this.connection.get(`${queries.SQL_SELECT_LICENSE} id=${id};`, (err: any, license: LicenseDTO) => {
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
    const self = this;
    return new Promise<Array<LicenseDTO>>(async (resolve, reject) => {
      try {
        this.connection.serialize(function () {
          self.connection.all(queries.SQL_SELECT_ALL_LICENSES, (err: any, license: Array<LicenseDTO>) => {
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
        let licenses: any = await this.getAll();
        licenses = licenses.reduce((acc, act) => {
          if (!acc[act.spdxid]) acc[act.spdxid] = act.id;
          return acc;
        }, {});
        this.connection.serialize(async () => {
          this.connection.run('begin transaction');
          for (const component of data) {
            if (component.license) {
              for (let i = 0; i < component.license.length; i += 1) {
                let licenseId = null;
                if (licenses[component.license[i]] !== undefined) {
                  licenseId = licenses[component.license[i]];
                } else {
                  licenseId = await this.bulkCreate(this.connection, {
                    spdxid: component.license[i],
                  });
                  licenses = {
                    ...licenses,
                    [component.license[i]]: licenseId,
                  };
                }
                await this.bulkAttachLicensebyId(this.connection, { compid: component.id, license_id: licenseId });
              }
            }
          }
          this.connection.run('commit', (err: any) => {
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
        db.run(queries.SQL_LICENSE_ATTACH_TO_COMPONENT_BY_ID, data.compid, data.license_id, (err: any) => {
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
        this.connection.serialize(() => {
          this.connection.run(queries.SQL_LICENSE_ATTACH_TO_COMPONENT_BY_ID, data.compid, data.license_id, (err: any) => {
            if (err) throw err;
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
        const stmt = this.connection.prepare(queries.SQL_ATTACH_LICENSE_BY_PURL_NAME);
        stmt.run(data.purl, data.version, data.license_name, (err: any) => {
          if (err) reject(new Error('License was not attached'));
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
        const stmt = this.connection.prepare(queries.SQL_ATTACH_LICENSE_PURL_SPDXID);
        stmt.run(data.purl, data.version, data.license_spdxid, (err: any) => {
          if (err) throw new Error('License was not attached');
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
        const stmt = this.connection.prepare(queries.SQL_CREATE_LICENSE);
        stmt.run(license.spdxid, license.name, license.fulltext, license.url, function (this: any, err: any) {
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
        this.connection.get(`${queries.SQL_SELECT_LICENSE}spdxid='${spdxid}';`, (err: any, license: any) => {
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
