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
import {   performance } from 'perf_hooks'
import { Querys } from './querys_db';
import { Db } from './db';
import { UtilsDb } from './utils_db';
import { Component, License } from '../../api/types';
import { LicenseDb } from './scan_license_db';

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
          const summary = await this.summaryByPurlVersion(comp);
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
          component = await this.allComp();
        }
        if (component !== undefined) resolve(component);
        else resolve({});
      } catch (error) {
        reject(new Error('unable to open db'));
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

  allComp() {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.all(query.SQL_GET_ALL_COMPONENTS, async (err: any, data: any) => {
            db.close();
            if (err) resolve([]);
            else {         
              const comp = self.processComponent(data);
              const summary: any = await self.allSummaries();
              for (let i = 0; i < comp.length; i += 1) {
                comp[i].summary = summary[i];
              }
              resolve(comp);
            }
          });
        });
      } catch (error) {
        console.log(error);
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
            // Attach license to a component
            self.processComponent(component);
            const licenses = await self.getAllLicensesFromComponentId(
              component.compid
            );
            component.licenses = licenses;
            const summary = await this.summaryByPurlVersion(component);
            component.summary = summary;       
            resolve(component);
          }
        );
      } catch (error) {
        reject(error);
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
        db.all(query.SQL_GET_UNIQUE_COMPONENT,
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

  allSummaries() {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(query.SQL_GET_ALL_SUMMARIES, (err: any, summary: any) => {
          db.close();
          if (err)resolve({});
          else resolve(summary);
        });
      } catch (error) {
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
            if (err) resolve({});
            else resolve(summary);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  async getCompVersions() {
    try {    
      const data = await this.getAll({});
      if (data) {  
        this.groupComponentsByName(data);
        const comp = this.mergeComp(data);   
        return await Promise.resolve(comp);
      } else {
        return await Promise.resolve([]);
      }
    } catch (error) {
      console.log(error);
    }
  }

// Group components by name
  private groupComponentsByName(data:any){
    data.sort((a, b) => a.name.localeCompare(b.name));  
  }

  private mergeComp(data: any) {
    const components: any = [];
    for (let i = 0; i < data.length; i += 1) {
      const comp: any = {};
      const version: any = {};
      comp.summary=data[i].summary;
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
    // Total summary of each component
    components.summary.identified+=data.summary.identified;
    components.summary.ignored+=data.summary.ignored;
    components.summary.pending+=data.summary.pending;
    components.versions.push(version);
  }
}
