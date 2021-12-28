/* eslint-disable @typescript-eslint/no-this-alias */
import log from 'electron-log';
import { Querys } from './querys_db';
import { Model } from './Model';
import { Component, ComponentParams, ComponentSource } from '../../api/types';
import { LicenseModel } from './LicenseModel';

// export interface ComponentParams {
//   source?: ComponentSource;
//   path?: string;
// }

// export enum ComponentSource {
//   ENGINE = 'engine',
// }

const query = new Querys();

export class ComponentModel extends Model {
  license: LicenseModel;

  public constructor(path: string) {
    super(path);
    this.license = new LicenseModel(path);
  }

  get(component: number) {
    return new Promise<Component>(async (resolve, reject) => {
      try {
        let comp: any;
        if (component) {
          comp = await this.getById(component);
          const summary = await this.summaryByPurlVersion(comp);
          comp.summary = summary;
          resolve(comp);
        } else throw new Error('Component not found');
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  private processComponent(data: any) {
    const results: any = [];

    for (let i = 0; i < data.length; i += 1) {
      const transformation: any = {};
      const preLicense: any = {};
      transformation.compid = data[i].compid;
      transformation.licenses = [];
      transformation.name = data[i].comp_name;
      transformation.purl = data[i].purl;
      transformation.url = data[i].comp_url;
      transformation.version = data[i].version;
      if (data[i].filesCount) transformation.filesCount = data[i].filesCount;

      if (data[i].license_id) {
        preLicense.id = data[i].license_id;
        preLicense.name = data[i].license_name;
        preLicense.spdxid = data[i].license_spdxid;
        transformation.licenses.push(preLicense);
      }
      results.push(transformation);
      let countMerged = 0;
      for (let j = i + 1; j < data.length; j += 1) {
        if (data[i].compid < data[j].compid) break;

        if (data[i].compid === data[j].compid) {
          this.mergeComponents(results[results.length - 1], data[j]);
          countMerged += 1;
        }
      }
      i += countMerged;
    }
    return results;
  }

  // merge component b into a
  private mergeComponents(a: any, b: any) {
    const preLicense: any = {};
    preLicense.id = b.license_id;
    preLicense.name = b.license_name;
    preLicense.spdxid = b.license_spdxid;
    a.licenses.push(preLicense);
  }

  public async allComp(params?: ComponentParams) {
    // const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        let sqlGetComp = '';
        if (params?.path && params?.source) {
          sqlGetComp = query.SQL_GET_ALL_DETECTED_COMPONENTS_BY_PATH.replace('#', `${params.path}/%`);
        } else if (params?.source === ComponentSource.ENGINE) {
          sqlGetComp = query.SQL_GET_ALL_DETECTED_COMPONENTS;
        } else {
          sqlGetComp = query.SQL_GET_ALL_COMPONENTS;
        }
        const db = await this.openDb();
        db.serialize(() => {
          db.all(sqlGetComp, async (err: any, data: any) => {
            db.close();
            if (err) throw err;
            else {
              const comp = this.processComponent(data);
              const summary: any = await this.allSummaries();
              for (let i = 0; i < comp.length; i += 1) {
                comp[i].summary = summary[comp[i].compid];
              }
              resolve(comp);
            }
          });
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  public async getByPurl(data: any, params: ComponentParams) {
    // const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        let SQLQuery = '';
        if (params?.path) SQLQuery = query.SQL_GET_COMPONENT_BY_PURL_ENGINE_PATH.replace('#', `'${params.path}/%'`);
        else SQLQuery = query.SQL_GET_COMPONENT_BY_PURL_ENGINE;
        const db = await this.openDb();
        db.all(SQLQuery, data.purl, data.purl, async (err: any, component: any) => {
          db.close();
          if (err) throw err;
          // Attach licenses to a component
          const comp = this.processComponent(component);
          resolve(comp);
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  // GET COMPONENENT ID FROM PURL
  public async getbyPurlVersion(data: any) {
    // const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.get(query.SQL_GET_COMPONENT_BY_PURL_VERSION, data.purl, data.version, async (err: any, component: any) => {
          db.close();
          if (err) throw err;
          // Attach license to a component
          this.processComponent(component);
          const licenses = await this.getAllLicensesFromComponentId(component.compid);
          component.licenses = licenses;
          const summary = await this.summaryByPurlVersion(component);
          component.summary = summary;
          resolve(component);
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  // CREATE COMPONENT
  create(component: any) {
    const self = this;
    return new Promise<Component>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          db.run(
            query.COMPDB_SQL_COMP_VERSION_INSERT,
            component.name,
            component.version,
            component.description ? component.description : 'n/a',
            component.url ? component.url : null,
            component.purl,
            'manual',
            async function (this: any, err: any) {
              db.close();
              if (err) throw err;
              if (this.lastID === 0) reject(new Error('Component already exists'));
              await self.license.licenseAttach({
                license_id: component.license_id,
                compid: this.lastID,
              });
              const newComp = await self.get(this.lastID);
              resolve(newComp);
            }
          );
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  // GET COMPONENT VERSIONS
  private getById(id: number) {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          db.get(query.SQL_GET_COMPONENT_BY_ID, `${id}`, async function (err: any, data: any) {
            db.close();
            if (err) throw err;
            const licenses = await self.getAllLicensesFromComponentId(data.compid);
            data.licenses = licenses;
            resolve(data);
          });
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  // GET LICENSE ATTACHED TO A COMPONENT
  private getAllLicensesFromComponentId(id: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          db.all(query.SQL_GET_LICENSES_BY_COMPONENT_ID, `${id}`, (err: any, data: any) => {
            db.close();
            if (err) throw err;
            else resolve(data);
          });
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  public async getLicensesAttachedToComponentsFromResults() {
    return new Promise<Array<any>>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(
          `SELECT cv.id,r.license FROM component_versions cv INNER JOIN results r ON cv.purl=r.purl AND cv.version = r.version;`,
          async (err: any, data: Array<any>) => {
            db.close();
            if (err) throw err;
            data.forEach((item) => {
              if (item.license === ' ' || item.license === '' || item.license === null) item.license = null;
              else item.license = item.license.split(',');
            });
            resolve(data);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  public async import(components: Array<Partial<Component>>) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          db.run('begin transaction');
          components.forEach((component) => {
            db.run(
              query.COMPDB_SQL_COMP_VERSION_INSERT,
              component.name,
              component.version,
              'AUTOMATIC IMPORT',
              component.url,
              component.purl,
              'engine'
            );
          });
          db.run('commit', (err: any) => {
            db.close();
            if (err) throw err;
            resolve();
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // COMPONENT NEW
  public async componentNewImportFromResults(db: any, data: any) {
    return new Promise<boolean>((resolve) => {
      db.run(
        query.COMPDB_SQL_COMP_VERSION_INSERT,
        data.component,
        data.version,
        'AUTOMATIC IMPORT',
        data.url,
        data.purl,
        'engine',
        (err: any) => {
          log.error(err);
          resolve(true);
        }
      );
    });
  }

  update(component: Component) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          const stmt = db.prepare(query.SQL_COMPDB_COMP_VERSION_UPDATE);
          stmt.run(
            component.name,
            component.version,
            component.description,
            component.url,
            component.purl,
            component.description,
            component.compid,
            (err: any) => {
              if (err) throw err;
            }
          );
          db.close();
          stmt.finalize();
          resolve(true);
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  public async getUniqueComponentsFromResults() {
    return new Promise<Array<Partial<Component>>>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(query.SQL_GET_UNIQUE_COMPONENT, (err: any, data: any) => {
          db.close();
          if (err) throw err;
          data.forEach((result) => {
            if (result.license) result.license = result.license.split(',');
          });
          resolve(data);
        });
      } catch (error: any) {
        log.error(error);
        reject(error);
      }
    });
  }

  private allSummaries() {
    // const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(query.SQL_GET_ALL_SUMMARIES, (err: any, data: any) => {
          db.close();
          if (err) throw err;
          else {
            const summary = this.groupSummaryByCompid(data);
            resolve(summary);
          }
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  private groupSummaryByCompid(data: any) {
    const aux = {};
    for (const i of data) {
      const key = i.compid;
      const value = i;
      if (!aux[key]) aux[`${key}`] = [];
      // if (!aux.hasOwnProperty(i.compid)) aux[`${key}`];
      aux[`${key}`] = value;
    }
    return aux;
  }

  private summaryByPurlVersion(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.get(query.SQL_GET_SUMMARY_BY_PURL_VERSION, data.purl, data.version, (err: any, summary: any) => {
          db.close();
          if (err) throw err;
          else resolve(summary);
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  public async summaryByPurl(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.get(query.SQL_GET_SUMMARY_BY_PURL, data.purl, (err: any, summary: any) => {
          db.close();
          if (err)
            resolve({
              identified: 0,
              pending: 0,
              ignored: 0,
            });
          else resolve(summary);
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  public getIdentifiedForReport() {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(
          `SELECT DISTINCT c.id,c.name AS comp_name , c.version, c.purl,c.url,l.name AS license_name, l.spdxid
        FROM component_versions c
        INNER JOIN inventories i ON c.id=i.cvid
        INNER JOIN licenses l ON l.spdxid=i.spdxid ORDER BY i.spdxid;`,
          (err: any, data: any) => {
            db.close();
            if (err) throw err;
            resolve(data);
          }
        );
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  public getNotValid() {
    return new Promise<number[]>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(
          `SELECT DISTINCT cv.id FROM (
            SELECT notValid.purl,notValid.version FROM results notValid WHERE NOT EXISTS
            (SELECT valid.purl,valid.version FROM results valid WHERE valid.dirty=0 AND notValid.purl=valid.purl AND notValid.version=valid.version)
             ) AS possibleNotValid
             INNER JOIN component_versions cv ON cv.purl=possibleNotValid.purl AND cv.version=possibleNotValid.version
             WHERE cv.id NOT IN (SELECT cvid FROM inventories);`,
          (err: any, data: any) => {
            db.close();
            if (err) throw err;
            const ids: number[] = data.map((item: Record<string, number>) => item.id);
            resolve(ids);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  public deleteByID(componentIds: number[]) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        let deleteCompByIdQuery = 'DELETE FROM component_versions WHERE id in ';
        deleteCompByIdQuery += `(${componentIds.toString()});`;
        db.all(deleteCompByIdQuery, (err: any) => {
          db.close();
          if (err) throw err;
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  public async updateOrphanToManual() {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.run(
          `UPDATE component_versions  SET source='manual' WHERE  id IN ( SELECT i.cvid FROM inventories i INNER JOIN component_versions cv ON cv.id=i.cvid WHERE (cv.purl,cv.version) NOT IN (SELECT r.purl,r.version FROM results r));`,
          (err: any) => {
            db.close();
            if (err) throw err;
            resolve();
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  public getSummaryByPath(path: string, purls: string[]) {
    return new Promise<Array<any>>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          let SQLquery = `SELECT r.purl,SUM(f.identified) AS identified,SUM(f.ignored) AS ignored ,SUM((CASE WHEN  f.identified=0 AND f.ignored=0 THEN 1 ELSE 0 END)) as pending FROM results r INNER JOIN files f ON f.fileId=r.fileId WHERE f.path LIKE # AND r.purl IN ? GROUP BY r.purl;`;
          SQLquery = SQLquery.replace('#', `'${path}/%'`);
          const aux = `'${purls.join("','")}'`;
          SQLquery = SQLquery.replace('?', `(${aux})`);
          db.all(SQLquery, (err: any, data: any) => {
            db.close();
            if (err) throw err;
            else resolve(data);
          });
        });
      } catch (error) {
        log.error(error);
        reject(new Error('Unable to retrieve summary by path'));
      }
    });
  }
}
