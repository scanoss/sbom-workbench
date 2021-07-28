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

const query = new Querys();

export class InventoryDb extends Db {
  component: any;

  constructor(path: string) {
    super(path);
    this.component = new ComponentDb(path);
  }

  private getByFilePath(inventory: Partial<Inventory>) {
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
            query.SQL_SCAN_SELECT_INVENTORIES_FROM_PURL,
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
    try {
      const db = await this.openDb();
      await this.updateIdentified(inventory);
      db.serialize(function () {
        db.run('begin transaction');
        if (inventory.files)
          for (const path of inventory.files) {
            db.run(query.SQL_INSERT_FILE_INVENTORIES, path, inventory.id);
          }
        db.run('commit', () => {
          db.close();
        });
      });
    } catch (error) {
      return Promise.reject(new Error('Unable to attach inventory'));
    }
    return Promise.resolve(true);
  }

  // DETACH FILE INVENTORY
  async detachFileInventory(inventory: Partial<Inventory>) {
    try {
      await this.pending(inventory);
      const db = await this.openDb();
      db.serialize(function () {
        db.run('begin transaction');
        if (inventory.files) {
          for (const path of inventory.files) {
            db.run(query.SQL_DELETE_FILE_INVENTORIES, path, inventory.id);
          }
        }
        db.run('commit', () => {
          db.close();
        });
      });
    } catch (error) {
      return Promise.reject(new Error('Unable to detach inventory'));
    }
    return Promise.resolve(true);
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
        if (inventory.purl !== undefined && inventory.version !== undefined) {
          inventories = await this.getByPurlVersion(inventory);
        } else if (inventory.files) {
          inventories = await this.getByFilePath(inventory);
        } else {
          inventories = await this.getAllInventories();
        }
        if (inventory !== undefined) {       
          for (let i = 0; i < inventories.length; i += 1) {          
            const comp = await this.component.getAll(inventories[i]);
            inventories[i].component = comp;
            // Remove purl and version from inventory
            delete inventories[i].purl;
            delete inventories[i].version;
          }
          resolve(inventories);
        } else {
          resolve([]);
        }
      } catch (error) {
        reject(new Error('error'));
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

  // NEW INVENTORY
  async create(inventory: Partial<Inventory>) {
    const self = this;
    const db = await this.openDb();
    return new Promise<Partial<Inventory>>(async (resolve, reject) => {
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
          await self.attachFileInventory(inventory);
          const comp = await self.component.getAll(inventory);
          inventory.component = comp;
          if (err) {
            reject(new Error(err));
          } else {
            resolve(inventory);
          }
        }
      );
    });
  }

  // UPDATE IDENTIFIED FILES
   updateIdentified(inventory: Partial<Inventory>) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        if (inventory.files)
          for (let i = 0; i<inventory.files.length; i += 1) {
            db.run(query.SQL_FILES_UPDATE_IDENTIFIED, inventory.files[i], inventory.version, inventory.purl);
        }
        resolve(true);
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
  getAllAttachedToAComponent(component: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.all(
            query.SQL_SELECT_ALL_INVENTORIES_ATTACHED_TO_COMPONENT,
            `${component.purl}`,
            `${component.version}`,
            (err: any, data: any) => {
              db.close();
              if (err) reject(new Error('[]'));
              else resolve(data);
            }
          );
        });
      } catch (error) {
        reject(new Error('[]'));
      }
    });
  }

  // GET ALL THE INVENTORIES ATTACHED TO A FILE
  getAllAttachedToAFile(inventory: Inventory) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.all(query.SQL_SELECT_ALL_INVENTORIES_FROM_FILE, `${inventory.files[0]}`, (err: any, data: any) => {
            db.close();
            if (err) reject(new Error('[]'));
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

  // TODO: workaround until change in DB
  pending(inventory: Partial<Inventory>) {
    console.log(inventory);
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.run('begin transaction');
          if (inventory.files) {
            for (let i = 0; i < inventory.files.length; i += 1) {
              db.run( 'UPDATE results SET ignored=0,identified=0 WHERE results.file_path = ? AND results.version = ? AND results.purl = ?;',
                inventory.files[i], inventory.version, inventory.purl);
            }
          }
          db.run('commit', () => {
            db.close();
            resolve(true);
          });
        });
      } catch (error) {
        reject(new Error('detach files were not successfully'));
      }
    });
  }
}
