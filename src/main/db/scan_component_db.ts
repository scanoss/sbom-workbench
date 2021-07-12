/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-syntax */
import { Querys } from './querys_db';
import { Db } from './db';
import { UtilsDb } from './utils_db';
import { Component } from '../../api/types';

const utilsDb = new UtilsDb();
const query = new Querys();

export class ComponentDb extends Db {
  constructor() {
    super();
  }

  get(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const component = await this.getById(data.id);
        if (component !== undefined) resolve(component);
        else resolve([]);
      } catch (error) {
        reject(error);
      }
    });
  }

  getAll(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        let component: any;
        if (data.purl && data.version) {
          console.log('version purl');
          component = await this.getbyPurlVersion(data);
        } else {
          console.log('all');
          component = await this.getAllComponents();
        }
        resolve(component);
      } catch (error) {
        reject(new Error('unable to open db'));
      }
    });
  }

  private getAllComponents() {
    const self = this;
    return new Promise<number>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(
          query.SQL_GET_ALL_COMPONENTS,
          async (err: any, component: any) => {
            if (err) reject(new Error(undefined));
            db.close();

            for (let i = 0; i < component.length; i += 1) {
              const licenses = await self.getAllLicensesFromComponentId(
                component[i].compid
              );
              component[i].licenses = licenses;
            }
            resolve(component);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  // // GET COMPONENENT ID FROM PURL
  private getbyPurlVersion(data: any) {
    const self = this;
    return new Promise<number>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.get(
          query.SQL_GET_COMPONENT_BY_PURL_VERSION,
          data.purl,
          data.version,
          async (err: any, component: any) => {
            db.close();
            if (err) reject(new Error(undefined));
            const licenses = await self.getAllLicensesFromComponentId(
              component.compid
            );
            component.licenses = licenses;
            resolve(component);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  // GET LICENSES BY COMPONENT ID
  private getLicensesAttachedToComponentById(cvId: number) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.all(
            query.SQL_GET_COMPV_LICENSE_BY_COMPID,
            `${cvId}`,
            (err: any, data: any) => {
              db.close();
              if (err) {
                resolve('[]');
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

  // CREATE COMPONENT
  create(component: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const stmt = db.prepare(query.COMPDB_SQL_COMP_VERSION_INSERT);
        db.serialize(function () {
          stmt.run(
            component.name,
            component.version,
            component.description,
            component.url,
            component.purl,
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

  // GET COMPONENT VERSIONS
  getById(id: number) {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.all(
            query.SQL_GET_COMPONENT_BY_ID,
            `${id}`,
            async function (err: any, data: any) {
              db.close();
              if (err) resolve(undefined);
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

  // GET LICENSE ATTACHED TO A COMPONENT
  private getAllLicensesFromComponentId(id: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.all(
            query.SQL_GET_LICENSES_BY_COMPONENT_ID,
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

  getByNAme() {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.all(
            'SELECT id,comp_name,url,purl,version FROM component_versions where comp_name like ?',
            '%p',
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

  // IMPORT UNIQUE RESULTS TO COMP DB FROM FILE RESULTS
  importUniqueFromFile(resultPath: string) {
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

  // IMPORT UNIQUE RESULTS TO COMP DB FROM JSON RESULTS
  importUniqueFromJson(json: string) {
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

  // COMPONENT NEW
  private componentNewImportFromResults(db: any, data: any) {
    return new Promise(async (resolve, reject) => {
      db.serialize(function () {
        const stmt = db.prepare(query.COMPDB_SQL_COMP_VERSION_INSERT);
        stmt.run(
          data.component,
          data.version,
          'AUTOMATIC IMPORT',
          data.url,
          data.purl ? data.purl[0] : 'n/a',
          (err: any) => {
            if (err) reject(new Error('error'));
          }
        );
        stmt.finalize();
        resolve(true);
      });
    });
  }

  // IMPORT COMPONENTS FROM JSON
  importFromJSON(component: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        for (let i = 0; i < component.length; i += 1) {
          await this.componentNewImport(db, component[i]);
        }
        db.close();
        resolve(true);
      } catch (error) {
        reject(new Error('Unable to import scan results'));
      }
    });
  }

  // IMPORT COMPONENT FROM FILE
  importFromFile(path: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const results: Record<any, any> = await utilsDb.readFile(path);
        const db = await this.openDb();
        for (let i = 0; i < results.length; i += 1) {
          await this.componentNewImport(db, results[i]);
        }
        db.close();
        resolve(true);
      } catch (error) {
        reject(new Error('Unable to import scan results'));
      }
    });
  }

  // COMPONENT NEW
  private componentNewImport(db: any, data: any) {
    return new Promise(async (resolve, reject) => {
      db.serialize(function () {
        const stmt = db.prepare(query.COMPDB_SQL_COMP_VERSION_INSERT);
        stmt.run(
          data.name,
          data.version,
          data.description,
          data.url,
          data.purl,
          (err: any) => {
            if (err) reject(new Error('error'));
          }
        );
        stmt.finalize();
        resolve(true);
      });
    });
  }

  update(component: Component) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          const stmt = db.prepare(query.SQL_COMPDB_COMP_VERSION_UPDATE);
          stmt.run(
            component.name,
            component.version,
            component.description,
            component.url,
            component.purl,
            component.description,
            component.id,
            (err: any) => {
              if (err) resolve(false);
            }
          );
          db.close();
          stmt.finalize();
          resolve(true);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
