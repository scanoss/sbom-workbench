/* eslint-disable no-else-return */
/* eslint-disable consistent-return */
/* eslint-disable import/no-cycle */
/* eslint-disable prettier/prettier */
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
import { Component, License } from '../../api/types';
import { LicenseDb } from './scan_license_db';

interface Summary {
  identified: number;
  ignored: number;
  pending: number;
}

const utilsDb = new UtilsDb();
const query = new Querys();

export class ComponentDb extends Db {
  license: LicenseDb;

  constructor(path: string) {
    super(path);
    this.license = new LicenseDb(path);
  }

  get(component: Partial<Component>) {
    return new Promise(async (resolve, reject) => {
      try {
        let comp: any;
        if (component.compid) {
          comp = await this.getById(component.compid);
          const summary = await this.summary(comp);
          comp.summary = summary;
          resolve(comp);
        } else resolve([]);
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
          component = await this.getbyPurlVersion(data);
        } else {
          component = await this.getAllComponents();
        }
        if (component !== undefined) resolve(component);
        else resolve({});
      } catch (error) {
        reject(new Error('unable to open db'));
      }
    });
  }

  private getAllComponents() {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(
          query.SQL_GET_ALL_COMPONENTS,
          async (err: any, component: any) => {
            if (err) resolve(undefined);
            db.close();
            for (let i = 0; i < component.length; i += 1) {
              const licenses = await self.getAllLicensesFromComponentId(
                component[i].compid
              );
              const summary = await this.summary(component[i]);
              component[i].summary = summary;
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

  // GET COMPONENENT ID FROM PURL
  private getbyPurlVersion(data: any) {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.get(
          query.SQL_GET_COMPONENT_BY_PURL_VERSION,
          data.purl,
          data.version,
          async (err: any, component: any) => {
            db.close();
            if (err) resolve(undefined);
            const licenses = await self.getAllLicensesFromComponentId(
              component.compid
            );
            const summary = await this.summary(component);
            component.summary = summary;
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
          db.get(
            query.SQL_GET_COMPONENT_BY_ID,
            `${id}`,
            async function (err: any, data: any) {
              db.close();
              if (err) resolve(undefined);
              else {
                const licenses = await self.getAllLicensesFromComponentId(
                  data.compid
                );
                data.licenses = licenses;
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

  // IMPORT UNIQUE RESULTS TO COMP DB FROM JSON RESULTS
  importUniqueFromFile() {
    const self = this;
    const attachLicComp = {
      license_id: 0,
      compid: 0,
    };
    let license: License;
    license = {
      id: 0,
      name: '',
      spdxid: '',
      fulltext: 'AUTOMATIC IMPORT',
      url: 'AUTOMATIC IMPORT',
    };
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const results = await this.getUnique();
        db.serialize(async function () {
          db.run('begin transaction');
          for (const result of results) {
            if (result.license !== 'NULL') {
              license.spdxid = result.license;
              attachLicComp.license_id = await self.license.getLicenseIdFilter(
                license
              );
              if (attachLicComp.license_id === 0) {
                license = await self.license.bulkCreate(db, license);
                if (license.id) attachLicComp.license_id = license.id;
              }
            } else {
              attachLicComp.license_id = await self.license.getLicenseIdFilter(
                license
              );
            }
            attachLicComp.compid = await self.componentNewImportFromResults(
              db,
              result
            );
            await self.license.bulkAttachLicensebyId(db, attachLicComp);
          }
          db.run('commit', () => {
            db.close();
            resolve(true);
          });
        });
      } catch (error) {
        console.log(error);
        resolve(false);
      }
    });
  }

  // COMPONENT NEW
  private componentNewImportFromResults(db: any, data: any) {
    return new Promise<number>(async (resolve, reject) => {
      db.run(
        query.COMPDB_SQL_COMP_VERSION_INSERT,
        data.component,
        data.version,
        'AUTOMATIC IMPORT',
        data.url,
        data.purl,
        function (this: any, err: any) {
          resolve(this.lastID);
        }
      );
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
            component.compid,
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

  private async getUnique() {
    try {
      const db = await this.openDb();
      return await new Promise<any>(async (resolve, reject) => {
        db.all(
          'SELECT DISTINCT purl,version,license,component,url FROM results;',
          (err: any, data: any) => {
            db.close();
            if (!err) resolve(data);
            else resolve([]);
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }

  private identifiedSummary(db: any, data: any) {
    return new Promise<number>(async (resolve) => {
      db.get(
        query.SQL_COMP_SUMMARY_IDENTIFIED,
        data.purl,
        data.version,
        async (err: any, comp: any) => {
          if (err) resolve(0);
          if (comp !== undefined) resolve(comp.identified);
        }
      );
    });
  }

  private ignoredSummary(db: any, data: any) {
    return new Promise<number>(async (resolve) => {
      db.get(
        query.SQL_COMP_SUMMARY_IGNORED,
        data.purl,
        data.version,
        async (err: any, comp: any) => {
          if (err) resolve(0);
          if (comp !== undefined) resolve(comp.ignored);
        }
      );
    });
  }

  private pendingSummary(db: any, data: any) {
    return new Promise<number>(async (resolve) => {
      db.get(
        query.SQL_COMP_SUMMARY_PENDING,
        data.purl,
        data.version,
        async (err: any, comp: any) => {
          if (err) resolve(0);
          if (comp !== undefined) resolve(comp.pending);
        }
      );
    });
  }

  summary(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const summary: Summary = {
          ignored: 0,
          identified: 0,
          pending: 0,
        };
        const db = await this.openDb();
        summary.identified = await this.identifiedSummary(db, data);
        summary.ignored = await this.ignoredSummary(db, data);
        summary.pending = await this.pendingSummary(db, data);
        db.close();
        resolve(summary);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getCompVersions() {
    try {
      const data = await this.getAll({});
      if (data) {
        const comp = this.mergeComp(data);
        return await Promise.resolve(comp);
      } else {
        return await Promise.resolve([]);
      }
    } catch (error) {
      console.log(error);
    }
  }

  private mergeComp(data: any) {
    const components: any = [];
    for (let i = 0; i < data.length; i += 1) {
      const comp: any = {};
      const version: any = {};
      let mergeCounter = 0;
      comp.name = data[i].name;
      comp.purl = data[i].purl;
      comp.url = data[i].url;
      comp.versions = [];
      version.licenses = data[i].licenses.slice();
      version.version = data[i].version;
      comp.versions.push(version);
      components.push(comp);
      mergeCounter = 0;
      for (let j = i + 1; j < data.length; j += 1) {
        if (data[i].name !== data[j].name) {
          break;
        }
        if (data[i].name === data[j].name) {
          this.mergeCompVersion(components[components.length - 1], data[j]);
          mergeCounter += 1;
        }
      }
      i += mergeCounter;
    }
    return components;
  }

  private mergeCompVersion(components: any, data: any) {
    const version: any = {};
    version.licenses = data.licenses.slice();
    version.version = data.version;
    components.versions.push(version);
  }
}
