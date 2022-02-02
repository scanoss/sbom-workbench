/* eslint-disable @typescript-eslint/no-this-alias */

import log from 'electron-log';
import { Querys } from './querys_db';
import { Model } from './Model';
import { ComponentModel } from './ComponentModel';
import { Inventory, Files } from '../../api/types';
import { ResultModel } from './ResultModel';

const query = new Querys();

export class InventoryModel extends Model {
  component: ComponentModel;

  results: ResultModel;

  constructor(path: string) {
    super(path);
    this.component = new ComponentModel(path);
    this.results = new ResultModel(path);
  }

  public async getByResultId(inventory: Partial<Inventory>) {
    return new Promise(async (resolve) => {
      try {
        if (inventory.files) {
          const db = await this.openDb();
          db.all(query.SQL_SCAN_SELECT_INVENTORIES_FROM_PATH, inventory.files[0], (err: any, data: any) => {
            db.close();
            if (err) resolve([]);
            else resolve(data);
          });
        }
      } catch (error) {
        log.error(error);
        resolve(undefined);
      }
    });
  }

  public async getByPurlVersion(inventory: Partial<Inventory>) {
    return new Promise(async (resolve) => {
      try {
        const db = await this.openDb();
        if (inventory.purl !== undefined) {
          db.all(
            query.SQL_SCAN_SELECT_INVENTORIES_FROM_PURL_VERSION,
            inventory.purl,
            inventory.version,
            (err: any, inv: any) => {
              db.close();
              if (err) resolve(undefined);
              else resolve(inv);
            }
          );
        }
      } catch (error) {
        log.error(error);
        resolve(undefined);
      }
    });
  }

  public async getAll() {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(query.SQL_GET_ALL_INVENTORIES, (err: any, inv: any) => {
          db.close();
          if (err) resolve(undefined);
          else resolve(inv);
        });
      } catch (error) {
        log.error(error);
        reject(new Error('The inventory does not exists'));
      }
    });
  }

  // CREATE NEW FILE INVENTORY
  public async attachFileInventory(inventory: Partial<Inventory>) {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          db.run('begin transaction');
          if (inventory.files)
            for (const id of inventory.files) {
              db.run(query.SQL_INSERT_FILE_INVENTORIES, id, inventory.id);
            }
          db.run('commit', (err: any) => {
            if (err) throw err;
            db.close();
            resolve(true);
          });
        });
      } catch (error) {
        log.error(error);
        reject(new Error('Unable to attach inventory'));
      }
    });
  }

  // DETACH FILE INVENTORY
  public async detachFileInventory(inventory: Partial<Inventory>) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          const resultsid = `(${inventory.files.toString()});`;
          const sqlDeleteFileInventory = query.SQL_DELETE_FILE_INVENTORIES + resultsid;
          db.run('begin transaction');
          db.run(sqlDeleteFileInventory);
          db.run('commit', (err: any) => {
            db.close();
            if (err) throw err;
            resolve();
          });
        });
      } catch (error) {
        log.error(error);
        reject(new Error('Unable to detach inventory'));
      }
    });
  }

  public async emptyInventory() {
    return new Promise<Array<Partial<Inventory>>>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          db.run('begin transaction');
          db.all(query.SQL_SELECT_INVENTORIES_NOT_HAVING_FILES, async (err: any, inventories: any) => {
            db.close();
            if (err) throw err;
            resolve(inventories);
          });
        });
      } catch (error) {
        log.error(error);
        reject(new Error('Empty inventory error'));
      }
    });
  }

  public async deleteAllEmpty(id: number[]) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          db.run('begin transaction');
          const sqlDeleteEmptyInv = `DELETE FROM inventories WHERE id in (${id.toString()});`;
          db.run(sqlDeleteEmptyInv);
          db.run('commit', (err: any) => {
            if (err) throw err;
            db.close();
            resolve();
          });
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  // GET INVENTORY BY ID
  get(inventory: Partial<Inventory>) {
    return new Promise(async (resolve, reject) => {
      try {
        let inventories: any;
        if (inventory.id) {
          inventories = await this.getById(inventory.id);
          const comp = await this.component.get(inventories.cvid);
          const files = await this.getInventoryFiles(inventories);
          inventories.component = comp;
          inventories.files = files;
          resolve(inventories);
        } else {
          resolve([]);
        }
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  public getById(id: number) {
    return new Promise<Inventory>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.get(query.SQL_GET_INVENTORY_BY_ID, id, (err: any, inv: any) => {
          db.close();
          if (err) resolve(undefined);
          else resolve(inv);
        });
      } catch (error) {
        log.error(error);
        reject(new Error('The inventory does not exists'));
      }
    });
  }

  public async getByPurl(inventory: Partial<Inventory>) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(query.SQL_GET_INVENTORY_BY_PURL, inventory.purl, (err: any, inv: any) => {
          db.close();
          if (err) resolve(undefined);
          else resolve(inv);
        });
      } catch (error) {
        log.error(error);
        reject(new Error('The inventory does not exists'));
      }
    });
  }

  public async isInventory(inventory: Partial<Inventory>) {
    const db = await this.openDb();
    return new Promise<Partial<Inventory>>(async (resolve, reject) => {
      try {
        db.get(
          `SELECT id FROM inventories WHERE  notes=? AND usage=? AND spdxid=? AND cvid=?;`,
          inventory.notes ? inventory.notes : 'n/a',
          inventory.usage,
          inventory.spdxid,
          inventory.cvid,
          async function (err: any, inv: any) {
            db.close();
            if (err) throw Error('Unable to get existing inventory');
            resolve(inv);
          }
        );
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  async create(inventory: Partial<Inventory>) {
    return new Promise<Partial<Inventory>>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.run(
          query.SQL_SCAN_INVENTORY_INSERT,
          inventory.cvid,
          inventory.usage ? inventory.usage : 'n/a',
          inventory.notes ? inventory.notes : 'n/a',
          inventory.url ? inventory.url : 'n/a',
          inventory.spdxid ? inventory.spdxid : 'n/a',
          async function (this: any, err: any) {
            inventory.id = this.lastID;
            if (err) throw Error('Unable to create inventory');
          }
        );
        db.close();
        resolve(inventory);
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  update(inventory: Inventory): Promise<Inventory> {
    return new Promise(async (resolve, reject) => {
      const db = await this.openDb();
      try {
        db.run(
          query.SQL_UPDATE_INVENTORY,
          inventory.cvid,
          inventory.usage,
          inventory.notes,
          inventory.url ? inventory.url : '',
          inventory.spdxid,
          inventory.id,
          (err: any) => {
            db.close();
            if (err) throw Error('Unable to update inventory');
            resolve(inventory);
          }
        );
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  // GET ALL THE INVENTORIES ATTACHED TO A COMPONENT
  public async getFromComponent() {
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
        log.error(error);
        reject(error);
      }
    });
  }

  // FIX ME
  private groupByComponentName(data: any) {
    const aux: Record<string, any> = data.reduce((acc, value) => {
      const key = value.name;
      if (!acc[key]) acc[key] = [];
      acc[`${key}`].push(value);
      return acc;
    }, {});
    const inventories = [];
    Object.entries(aux).forEach(([key, value]) => {
      const inv: any = {};
      inv.component = key;
      inv.vendor = value[0].vendor;
      inv.inventories = value;
      inventories.push(inv);
    });
    return inventories;
  }

  // GET FILES ATTACHED TO AN INVENTORY BY INVENTORY ID
  public getInventoryFiles(inventory: Partial<Inventory>) {
    return new Promise<Files>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.all(
            query.SQL_SELECT_ALL_FILES_ATTACHED_TO_AN_INVENTORY_BY_ID,
            `${inventory.id}`,
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

  async delete(inventory: Partial<Inventory>) {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          db.run('begin transaction');
          db.run(query.SQL_SET_RESULTS_TO_PENDING_BY_INVID_PURL_VERSION, inventory.id);
          db.run(query.SQL_DELETE_INVENTORY_BY_ID, inventory.id);
          db.run('commit', (err: any) => {
            if (err) throw err;
            db.close();
            resolve(true);
          });
        });
      } catch (error) {
        log.error(error);
        reject(error);
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

  public async deleteDirtyFileInventories(id: number[]) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const deleteQuery = `DELETE FROM file_inventories WHERE fileId IN (${id.toString()});`;
        const db = await this.openDb();
        db.all(deleteQuery, (err: any) => {
          db.close();
          if (err) throw new Error('unable to delete files');
          else resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  public async createBatch(inventories: Array<Partial<Inventory>>) {
    return new Promise<Array<Inventory>>(async (resolve, reject) => {
      try {
        const inv: any = [];
        const db = await this.openDb();
        db.serialize(function () {
          db.run('begin transaction');
          for (let i = 0; i < inventories.length; i += 1) {
            db.run(
              query.SQL_SCAN_INVENTORY_INSERT,
              inventories[i].cvid,
              inventories[i].usage ? inventories[i].usage : 'n/a',
              inventories[i].notes ? inventories[i].notes : 'n/a',
              inventories[i].url ? inventories[i].url : 'n/a',
              inventories[i].spdxid ? inventories[i].spdxid : 'n/a',
              function (this: any, err: any) {
                inventories[i].id = this.lastID;
                inv.push(inventories[i]);
              }
            );
          }
          db.run('commit', (err: any) => {
            if (err) throw err;
            db.close();
            resolve(inv);
          });
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  async attachFileInventoryBatch(inventoryFiles: any) {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const SQLQuery = query.SQL_INSERT_FILE_INVENTORIES_BATCH.replace('?', inventoryFiles.invFiles);
        db.run(SQLQuery, (err: any) => {
          db.close();
          if (err) throw err;
          resolve(true);
        });
      } catch (error) {
        log.error(error);
        reject(new Error('Unable to attach inventory'));
      }
    });
  }
}
