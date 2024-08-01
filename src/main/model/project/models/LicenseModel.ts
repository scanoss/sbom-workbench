import log from 'electron-log';
import { LicenseDTO, NewLicenseDTO } from '@api/dto';
import { License } from '@api/types';
import sqlite3 from 'sqlite3';
import { queries } from '../../querys_db';
import { IComponentLicense } from '../../interfaces/component/IComponentLicense';
import { Model } from '../../Model';
import util from 'util';
import { detectedLicenseSummaryAdapter } from '../../adapters/license/detectedLicenseSummaryAdapter';
import { After } from '../../hooks/after/afterHook';
import { LicenseReport } from 'main/services/ReportService';

export class LicenseModel extends Model {
  private connection: sqlite3.Database;

  public constructor(conn: sqlite3.Database) {
    super();
    this.connection = conn;
  }

  public create(license: NewLicenseDTO) {
    const self = this;
    return new Promise<Partial<LicenseDTO>>(async (resolve, reject) => {
      this.connection.serialize(async () => {
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
        this.connection.serialize(() => {
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
        this.connection.serialize(() => {
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
                  licenseId = await this.insertLicensesBulk({
                    spdxid: component.license[i],
                    fulltext: 'AUTOMATIC IMPORT',
                    url: 'AUTOMATIC IMPORT',
                    name: component.license[i],
                    official: 1,
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

  private insertLicensesBulk(license: License): Promise<number> {
    return new Promise<number>((resolve) => {
      this.connection.run(
        queries.SQL_CREATE_LICENSE,
        license.spdxid,
        license.spdxid,
        license.fulltext,
        license.url,
        license.official,
        function (this: any, error: any) {
          resolve(this.lastID);
        },
      );
    });
  }

  public async insertInBulk(licenses: Array<License>): Promise<Array<License>> {
    return new Promise<Array<License>>(async (resolve, reject) => {
      this.connection.serialize(async () => {
        this.connection.run('begin transaction');
        for (let i = 0; i < licenses.length; i += 1) {
          const licenseId = await this.insertLicensesBulk(licenses[i]);
          licenses[i].id = licenseId;
        }

        this.connection.run('commit', (err: any) => {
          if (!err) resolve(licenses);
          reject(err);
        });
      });
    });
  }

  public attachLicensesToComponentBulk(data: Array<{ compid: number, licenses: Array<Number> }>) {
    return new Promise<void>(async (resolve, reject) => {
      this.connection.serialize(async () => {
        this.connection.run('begin transaction');
        for (let i = 0; i < data.length; i += 1) {
          data[i].licenses.forEach((l) => {
            this.bulkAttachLicensebyId(this.connection, { compid: data[i].compid, license_id: l });
          });
        }

        this.connection.run('commit', (err: any) => {
          if (!err) resolve();
          reject(err);
        });
      });
    });
  }

  @After(detectedLicenseSummaryAdapter)
  public async getDetectedLicenseComponentSummary(): Promise<Array<LicenseReport>> {
    const call:any = util.promisify(this.connection.all.bind(this.connection));
    const detectedSummary = await call(`SELECT spdxid, SUM(detectedLicenseComponentCount) as componentLicenseCount, SUM(declaredLicenseDependencyCount) as dependencyLicenseCount , SUM(detectedLicenseComponentCount + declaredLicenseDependencyCount) as total FROM (
      -- First part: Count component license
      SELECT l.spdxid, COUNT(DISTINCT cv.purl || cv.version) as detectedLicenseComponentCount,  0 as declaredLicenseDependencyCount  FROM component_versions cv
      LEFT JOIN license_component_version lcv ON cv.id = lcv.cvid
      LEFT JOIN licenses l ON l.id = lcv.licid
      WHERE cv.source = 'engine'
      GROUP BY l.spdxid
      UNION
          -- Second part: splitting originalLicense by ',' and counting dependency licenses
            SELECT spdxid, 0 AS detectedLicenseComponentCount, count(*) as declaredLicenseDependencyCount FROM (
              WITH RECURSIVE split(label, str,purl,version) AS (
                 SELECT '', COALESCE(originalLicense, 'unknown') || ',', purl, version
                  FROM dependencies
                  UNION ALL
                 SELECT
              CASE 
                WHEN substr(str, 1, instr(str, ',') - 1) = '' THEN 'unknown'
                ELSE substr(str, 1, instr(str, ',') - 1)
              END,
                   substr(str, instr(str, ',') + 1),
				   purl,
				   version
                  FROM split 
                  WHERE str != ''
              )
              SELECT label as spdxid,purl,version
              FROM split
              WHERE label != ''
              GROUP BY spdxid,purl,version
          ) GROUP BY spdxid) as detected
      GROUP BY spdxid;`);
    return detectedSummary;
  }

  public async getIdentifedLicenseComponentSummary(): Promise<Array<LicenseReport>> {
    const call:any = util.promisify(this.connection.all.bind(this.connection));
    return await call(`SELECT i.spdxid as label ,COUNT (DISTINCT i.source || cv.purl || cv.version) as value FROM inventories i
    INNER JOIN component_versions cv ON cv.id = i.cvid
    GROUP BY i.spdxid;`);
  }

}


