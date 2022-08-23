/* eslint-disable @typescript-eslint/no-this-alias */
import log from 'electron-log';
import util from 'util';
import { Querys } from './querys_db';
import { Model } from './Model';
import { Component } from '../../api/types';
import { LicenseModel } from './LicenseModel';
import { QueryBuilder } from './queryBuilder/QueryBuilder';
import { componentHelper } from '../helpers/ComponentHelper';
import { IComponentLicenseReliable } from './interfaces/component/IComponentLicenseReliable';
import { INewComponent } from './interfaces/component/INewComponent';
import { ComponentVersion } from './entity/ComponentVersion';

const query = new Querys();

export class ComponentModel extends Model {
  public static readonly entityMapper = {
    path: 'f.path',
    purl: 'comp.purl',
    version: 'comp.version',
    source: 'comp.source',
  };

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
        } else throw new Error('ComponentCatalog not found');
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
        db.get(
          query.SQL_GET_COMPONENT_BY_PURL_VERSION,
          data.purl,
          data.version,
          async (err: any, component: any) => {
            db.close();
            if (err) throw err;
            // Attach license to a component
            componentHelper.processComponent(component);
            const licenses = await this.getAllLicensesFromComponentId(
              component.compid
            );
            component.licenses = licenses;
            const summary = await this.summaryByPurlVersion(component);
            component.summary = summary;
            resolve(component);
          }
        );
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  // CREATE COMPONENT
  public async create(component: ComponentVersion): Promise<ComponentVersion> {
    const db = await this.openDb();
    const call = util.promisify((callback) => {
      db.run(
        query.COMPDB_SQL_COMP_VERSION_CREATE,
        component.name,
        component.version,
        component.description ? component.description : 'n/a',
        component.url ? component.url : null,
        component.purl,
        component.source,
        function (this: any, err: any) {
          if (err) callback(err, null);
          else {
            component.id = this.lastID;
            callback(null, component);
          }
        }
      );
    });
    const newComponent = await call();
    db.close();
    await this.attachLicenses(newComponent as ComponentVersion);
    return newComponent as ComponentVersion;
  }

  private async attachLicenses(component: ComponentVersion): Promise<void> {
    const licenses = component
      .getLicenseIds()
      .map((l) =>
        this.license.licenseAttach({ compid: component.id, license_id: l })
      );
    await Promise.all(licenses);
  }

  // GET COMPONENT VERSIONS
  private getById(id: number) {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          db.get(
            query.SQL_GET_COMPONENT_BY_ID,
            `${id}`,
            async function (err: any, data: any) {
              db.close();
              if (err) throw err;
              const licenses = await self.getAllLicensesFromComponentId(
                data.compid
              );
              data.licenses = licenses;
              resolve(data);
            }
          );
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
          db.all(
            query.SQL_GET_LICENSES_BY_COMPONENT_ID,
            `${id}`,
            (err: any, data: any) => {
              db.close();
              if (err) throw err;
              else resolve(data);
            }
          );
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
          `SELECT DISTINCT cv.id,rl.spdxid FROM component_versions cv
           INNER JOIN results r ON cv.purl=r.purl AND cv.version = r.version
           INNER JOIN result_license rl ON r.id=rl.resultId
           ORDER BY cv.id;`,
          async (err: any, data: Array<any>) => {
            db.close();
            if (err) throw err;
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

  private summaryByPurlVersion(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.get(
          query.SQL_GET_SUMMARY_BY_PURL_VERSION,
          data.purl,
          data.version,
          (err: any, summary: any) => {
            db.close();
            if (err) throw err;
            else resolve(summary);
          }
        );
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
        db.get(
          query.SQL_GET_SUMMARY_BY_PURL,
          data.purl,
          (err: any, summary: any) => {
            db.close();
            if (err)
              resolve({
                identified: 0,
                pending: 0,
                ignored: 0,
              });
            else resolve(summary);
          }
        );
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
          `SELECT DISTINCT c.id,c.name AS comp_name , c.version, c.purl,c.url,l.name AS license_name, l.spdxid, r.vendor
        FROM component_versions c
        INNER JOIN inventories i ON c.id=i.cvid
        LEFT JOIN results r ON r.version = c.version AND r.purl = c.purl
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
          `SELECT cv.id FROM component_versions cv  WHERE NOT EXISTS (SELECT 1 FROM results WHERE purl=cv.purl AND version=cv.version) AND cv.id NOT IN (SELECT i.cvid FROM inventories i);`,
          (err: any, data: any) => {
            db.close();
            if (err) throw err;
            const ids: number[] = data.map(
              (item: Record<string, number>) => item.id
            );
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
          `UPDATE component_versions  SET source='manual' WHERE  id IN ( SELECT i.cvid FROM inventories i INNER JOIN component_versions cv ON cv.id=i.cvid AND i.source="detected" WHERE (cv.purl,cv.version) NOT IN (SELECT r.purl,r.version FROM results r));`,
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

  public getOverrideComponents() {
    return new Promise<Array<any>>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(query.SQL_GET_OVERRIDE_COMPONENTS, (err: any, data: any) => {
          db.close();
          if (err) throw err;
          else resolve(data);
        });
      } catch (error) {
        log.error(error);
        reject(new Error('Unable to retrieve summary by path'));
      }
    });
  }

  public getAll(queryBuilder?: QueryBuilder) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const SQLquery = this.getSQL(
          queryBuilder,
          query.SQL_GET_ALL_COMPONENTS,
          this.getEntityMapper()
        );
        const db = await this.openDb();
        db.all(
          SQLquery.SQL,
          ...SQLquery.params,
          async (err: any, data: any) => {
            db.close();
            if (err) throw err;
            else {
              const comp = componentHelper.processComponent(data);
              resolve(comp);
            }
          }
        );
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  public summary(queryBuilder?: QueryBuilder) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const SQLquery = this.getSQL(
          queryBuilder,
          query.SQL_COMPONENTS_SUMMARY,
          this.getEntityMapper()
        );
        const db = await this.openDb();
        db.all(
          SQLquery.SQL,
          ...SQLquery.params,
          async (err: any, data: any) => {
            db.close();
            if (err) throw err;
            else {
              resolve(data);
            }
          }
        );
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  public getMostReliableLicensePerComponent(): Promise<
    Array<IComponentLicenseReliable>
  > {
    return new Promise<Array<IComponentLicenseReliable>>(
      async (resolve, reject) => {
        try {
          const db = await this.openDb();
          db.all(
            `SELECT * FROM (SELECT cv.id AS cvid,rl.source,rl.spdxid AS reliableLicense,(CASE WHEN rl.source ='component_declared' THEN 1 WHEN rl.source = 'file_header' THEN 2 ELSE 3 END) ranking FROM results r LEFT JOIN component_versions cv
            ON cv.purl=r.purl  AND cv.version= r.version LEFT JOIN result_license rl
            ON r.id = rl.resultId
            GROUP BY cvid, rl.source,rl.spdxid
            HAVING rl.source LIKE 'component_declared' OR rl.source='file_header' OR rl.source = 'file_spdx_tag'
            ORDER BY ranking )AS compLicense
            GROUP BY cvid;`,
            (err: any, data: Array<IComponentLicenseReliable>) => {
              db.close();
              if (err) throw err;
              resolve(data);
            }
          );
        } catch (error) {
          log.error(error);
          reject(error);
        }
      }
    );
  }

  public updateMostReliableLicense(
    reliableLicenses: Array<IComponentLicenseReliable>
  ): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          db.run('begin transaction');
          for (let i = 0; i < reliableLicenses.length; i += 1) {
            db.run(
              'UPDATE component_versions SET reliableLicense=? WHERE id=?',
              reliableLicenses[i].reliableLicense,
              reliableLicenses[i].cvid
            );
          }
          db.run('commit', (err: any) => {
            db.close();
            if (err) throw err;
            resolve();
          });
        });
      } catch (error: any) {
        log.error(error);
        reject();
      }
    });
  }

  public getEntityMapper(): Record<string, string> {
    return ComponentModel.entityMapper;
  }
}
