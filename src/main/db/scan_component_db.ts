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

const utilsDb = new UtilsDb();
const query = new Querys();

interface Component {
  name: string;
  version: string;
  description: string;
  url: string;
  purl: string;
  license_name: string;
}

export class ComponentDb extends Db {
  constructor(path: string) {
    super(path);
  }

  get(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        let component: any;
        if (data.id) {
          component = await this.getById(data.id);
        } else if (data.purl && data.version) {
          component = await this.getbyPurlVersion(data);
        } else {
          component = await this.getAll();
        }
        resolve(component);
      } catch (error) {
        reject(new Error('unable to open db'));
      }
    });
  }

  private getAll() {
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

            console.log(component);
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

  // IMPORT UNIQUE RESULTS TO COMP DB FROM FILE
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

  // IMPORT UNIQUE RESULTS TO COMP DB FROM JSON
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
}
