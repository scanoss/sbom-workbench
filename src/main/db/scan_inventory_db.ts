/* eslint-disable no-prototype-builtins */
/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-syntax */
import { Querys } from './querys_db';
import { Db } from './db';
import { ComponentDb } from './scan_component_db';
import { Inventory } from '../../api/types';
import { ResultsDb } from './scan_results_db';

const query = new Querys();

export class InventoryDb extends Db {
  component: any;

  results: ResultsDb;

  constructor(path: string) {
    super(path);
    this.component = new ComponentDb(path);
    this.results = new ResultsDb(path);
  }

  private getByResultId(inventory: Partial<Inventory>) {
    return new Promise(async (resolve) => {
      try {
        if (inventory.files) {
          const db = await this.openDb();
          db.all(query.SQL_SCAN_SELECT_INVENTORIES_FROM_PATH, inventory.files[0], (err: object, data: any) => {
            db.close();
            if (err) resolve([]);
            else resolve(data);
          });
        }
      } catch (error) {
        resolve(undefined);
      }
    });
  }

  private getByPurlVersion(inventory: Partial<Inventory>) {
    return new Promise(async (resolve) => {
      try {
        const db = await this.openDb();
        if (inventory.purl !== undefined) {
          db.all(
            query.SQL_SCAN_SELECT_INVENTORIES_FROM_PURL_VERSION,
            inventory.purl,
            inventory.version,
            (err: object, inv: any) => {
              db.close();
              if (err) resolve(undefined);
              else resolve(inv);
            }
          );
        }
      } catch (error) {
        resolve(undefined);
      }
    });
  }

  private getAllInventories() {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(query.SQL_GET_ALL_INVENTORIES, (err: object, inv: any) => {
          db.close();
          if (err) resolve(undefined);
          else resolve(inv);
        });
      } catch (error) {
        reject(new Error('The inventory does not exists'));
      }
    });
  }

  // CREATE NEW FILE INVENTORY
  async attachFileInventory(inventory: Partial<Inventory>) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        await this.updateIdentified(inventory);
        db.serialize(function () {
          db.run('begin transaction');
          if (inventory.files)
            for (const id of inventory.files) {
              db.run(query.SQL_INSERT_FILE_INVENTORIES, id, inventory.id);
            }
          db.run('commit', () => {
            db.close();
            resolve(true);
          });
        });
      } catch (error) {
        reject(new Error('Unable to attach inventory'));
      }
    });
  }

  // DETACH FILE INVENTORY
  async detachFileInventory(inventory: Partial<Inventory>) {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(async function () {
          const resultsid = `(${inventory.files.toString()});`;
          const sqlDeleteFileInventory = query.SQL_DELETE_FILE_INVENTORIES + resultsid;
          await self.results.restore(inventory.files);
          db.run('begin transaction');
          if (inventory.files) {
            db.run(sqlDeleteFileInventory);
            db.run('commit', async () => {
              db.close();

              const success = await self.emptyInventory();
              if (success) resolve(true);
              else resolve(false);
            });
          }
        });
      } catch (error) {
        reject(new Error('Unable to detach inventory'));
      }
    });
  }

  private emptyInventory() {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.run('begin transaction');
          db.all(query.SQL_SELECT_INVENTORIES_NOT_HAVING_FILES, async (err: any, inventories: any) => {
            db.close();
            if (err) resolve(false);
            if (inventories.length > 0) await self.deleteAllEmpty(inventories);
            resolve(true);
          });
        });
      } catch (error) {
        reject(new Error('Empty inventory error'));
      }
    });
  }

  private deleteAllEmpty(data: any[]) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.run('begin transaction');
          for (const inventory of data) {
            db.run(query.SQL_DELETE_INVENTORY_BY_ID, inventory.id);
          }
          db.run('commit', () => {
            db.close();
            resolve(true);
          });
        });
      } catch (error) {
        return reject(new Error('detach files were not successfully'));
      }
    });
  }

  // GET INVENTORY BY ID
  get(inventory: Partial<Inventory>) {
    return new Promise(async (resolve, reject) => {
      try {
        let inventories: any;
        if (inventory.id) {
          inventories = await this.getById(inventory);
          const comp = await this.component.getAll(inventories);
          const files = await this.getInventoryFiles(inventories);
          inventories.component = comp;
          inventories.files = files;
          // Remove purl and version from inventory
          delete inventories.purl;
          delete inventories.version;
          resolve(inventories);
        } else {
          resolve([]);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  // GET ALL INVENTORIES BY PURL, VERSION OR FILES
  getAll(inventory: Partial<Inventory>) {
    return new Promise(async (resolve, reject) => {
      try {
        let inventories: any;
        if (inventory.purl && inventory.version) {
          inventories = await this.getByPurlVersion(inventory);
        } else if (inventory.files) {
          inventories = await this.getByResultId(inventory);
        } else if (inventory.purl) {
          inventories = await this.getByPurl(inventory);
        } else inventories = await this.getAllInventories();
        if (inventory !== undefined) {
          for (let i = 0; i < inventories.length; i += 1) {
            const comp = await this.component.getAll(inventories[i]);
            inventories[i].component = comp;
          }
          resolve(inventories);
        } else resolve([]);
      } catch (error) {
        reject(error);
      }
    });
  }

  private getById(inventory: Partial<Inventory>) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.get(query.SQL_GET_INVENTORY_BY_ID, inventory.id, (err: object, inv: any) => {
          db.close();
          if (err) resolve(undefined);
          else resolve(inv);
        });
      } catch (error) {
        reject(new Error('The inventory does not exists'));
      }
    });
  }

  private getByPurl(inventory: Partial<Inventory>) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(query.SQL_GET_INVENTORY_BY_PURL, inventory.purl, (err: object, inv: any) => {
          db.close();
          if (err) resolve(undefined);
          else resolve(inv);
        });
      } catch (error) {
        reject(new Error('The inventory does not exists'));
      }
    });
  }

  private async isInventory(inventory: Partial<Inventory>) {
    const db = await this.openDb();
    return new Promise<Partial<Inventory>>(async (resolve, reject) => {
      try {
        db.get(
          `SELECT id FROM inventories WHERE purl=? AND notes=? AND version=? AND usage=? AND license_name=?;`,
          inventory.purl,
          inventory.notes ? inventory.notes : 'n/a',
          inventory.version,
          inventory.usage,
          inventory.license_name,
          async function (err: any, inv: any) {
            if (err) throw Error('Unable to get existing inventory');
            resolve(inv);
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  // NEW INVENTORY
  async create(inventory: Partial<Inventory>) {
    const self = this;
    return new Promise<Partial<Inventory>>(async (resolve, reject) => {
      try {
        const inv = await this.isInventory(inventory);
        if (!inv) {
          const db = await this.openDb();
          db.run(
            query.SQL_SCAN_INVENTORY_INSERT,
            inventory.compid ? inventory.compid : 0,
            inventory.version,
            inventory.purl,
            inventory.usage ? inventory.usage : 'n/a',
            inventory.notes ? inventory.notes : 'n/a',
            inventory.url ? inventory.url : 'n/a',
            inventory.license_name ? inventory.license_name : 'n/a',
            async function (this: any, err: any) {
              inventory.id = this.lastID;
              if (err) reject(new Error(err));
            }
          );
        } else inventory.id = inv.id;

        await self.attachFileInventory(inventory);
        const comp = await self.component.getAll(inventory);
        inventory.component = comp;
        resolve(inventory);
      } catch (e) {
        reject(e);
      }
    });
  }

  // UPDATE IDENTIFIED FILES
  updateIdentified(inventory: Partial<Inventory>) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          const resultsid = `(${inventory.files.toString()});`;
          const sqlUpdateIdentified = query.SQL_FILES_UPDATE_IDENTIFIED + resultsid;
          db.run('begin transaction');
          db.run(sqlUpdateIdentified);
          db.run('commit', () => {
            db.close();
            return resolve(true);
          });
        });
      } catch (error) {
        reject(new Error('Unable to open db'));
      }
    });
  }

  // UPDATE INVENTORY
  update(inventory: Inventory) {
    return new Promise(async (resolve, reject) => {
      try {
        let success: any;
        if (inventory.id !== undefined) {
          success = await this.updateById(inventory);
        } else {
          success = await this.updateByPurl(inventory);
        }
        if (success) resolve(success);
        else resolve(false);
      } catch (error) {
        reject(new Error('Inventory was not updated'));
      }
    });
  }

  private updateByPurl(inventory: Inventory) {
    return new Promise(async (resolve) => {
      try {
        const db = await this.openDb();
        db.run(
          query.SQL_UPDATE_INVENTORY_BY_PURL_VERSION,
          inventory.compid ? inventory.compid : 0,
          inventory.version,
          inventory.purl,
          inventory.usage ? inventory.usage : 'n/a',
          inventory.notes ? inventory.notes : 'n/a',
          inventory.url ? inventory.url : 'n/a',
          inventory.license_name ? inventory.license_name : 'n/a',
          inventory.purl,
          inventory.version,
          async function (this: any, err: any) {
            if (err) resolve(false);
            resolve(true);
          }
        );
      } catch (error) {
        resolve(false);
      }
    });
  }

  private updateById(inventory: Partial<Inventory>) {
    return new Promise(async (resolve) => {
      try {
        const db = await this.openDb();
        db.run(
          query.SQL_UPDATE_INVENTORY_BY_ID,
          inventory.compid ? inventory.compid : 0,
          inventory.version,
          inventory.purl,
          inventory.usage ? inventory.usage : 'n/a',
          inventory.notes ? inventory.notes : 'n/a',
          inventory.url ? inventory.url : 'n/a',
          inventory.license_name ? inventory.license_name : 'n/a',
          inventory.id,
          async function (err: any) {
            db.close();
            if (err) resolve(false);
            resolve(true);
          }
        );
      } catch (error) {
        resolve(false);
      }
    });
  }

  // GET ALL THE INVENTORIES ATTACHED TO A COMPONENT
  getFromComponent() {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.all(query.SQL_SELECT_INVENTORY_COMPONENTS, (err: any, data: any) => {
            db.close();
            if (err) resolve([]);
            else {
              const inventories = self.groupByComponentName(data);
              resolve(inventories);
            }
          });
        });
      } catch (error) {
        reject(new Error('[]'));
      }
    });
  }

  private groupByComponentName(data: any) {
    const aux = data.reduce((acc, value) => {
      const key = value.name;
      if (!acc.hasOwnProperty(key)) acc[`${key}`] = [];
      acc[`${key}`].push(value);
      return acc;
    }, {});

    const inventories = [];
    Object.entries(aux).forEach(([key, value]) => {
      const inv: any = {};
      inv.component = key;
      inv.inventories = value;
      inventories.push(inv);
    });

    return inventories;
  }

  // GET ALL THE INVENTORIES ATTACHED TO A FILE
  getAllAttachedToAFile(inventory: Inventory) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.all(query.SQL_SELECT_ALL_INVENTORIES_FROM_FILE, `${inventory.files[0]}`, (err: any, data: any) => {
            db.close();
            if (err) resolve([]);
            else resolve(data);
          });
        });
      } catch (error) {
        reject(new Error('[]'));
      }
    });
  }

  // GET FILES ATTACHED TO AN INVENTORY BY INVENTORY ID
  getInventoryFiles(inventory: Partial<Inventory>) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.all(
            query.SQL_SELECT_ALL_FILES_ATTACHED_TO_AN_INVENTORY_BY_ID,
            `${inventory.id}`,
            (err: any, data: any) => {
              db.close();
              if (err) resolve([]);
              else resolve(data);
            }
          );
        });
      } catch (error) {
        reject(new Error('[]'));
      }
    });
  }

  async delete(inventory: Partial<Inventory>) {
    return new Promise(async (resolve, reject) => {
      try {
        // GET ALL DATA FROM INVENTORY ID
        const inv: any = await this.get(inventory);
        const db = await this.openDb();
        db.serialize(function () {
          db.run('begin transaction');
          db.run(query.SQL_SET_RESULTS_TO_PENDING_BY_INVID_PURL_VERSION, inv.id);
          db.run(query.SQL_DELETE_INVENTORY_BY_ID, inv.id);
          db.run('commit', () => {
            db.close();
            return resolve(true);
          });
        });
      } catch (error) {
        return reject(new Error('files were not successfully detached'));
      }
    });
  }

  getCurrentSummary() {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.all(query.SQL_GET_RESULTS_SUMMARY, (err: any, data: any) => {
            db.close();
            if (err) throw new Error('summary were not successfully retrieved');
            else resolve(data);
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
