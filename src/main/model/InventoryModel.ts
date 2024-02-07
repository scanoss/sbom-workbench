/* eslint-disable @typescript-eslint/no-this-alias */

import log from 'electron-log';
import util from 'util';
import { Querys } from './querys_db';
import { Model } from './Model';
import { ComponentModel } from './ComponentModel';
import { Inventory } from '../../api/types';
import { ResultModel } from './ResultModel';
import { QueryBuilder } from './queryBuilder/QueryBuilder';

const query = new Querys();

export class InventoryModel extends Model {
  component: ComponentModel;

  results: ResultModel;

  constructor(path: string) {
    super(path);
    this.component = new ComponentModel(path);
    this.results = new ResultModel(path);
  }

  public async getAll(queryBuilder?: QueryBuilder) {
    const SQLquery = this.getSQL(
      queryBuilder,
      query.SQL_GET_ALL_INVENTORIES,
      { purl: 'c.purl', version: 'c.version', filePath: 'f.path', usage: 'i.usage', source: 'i.source' },
    );
    const db = await this.openDb();
    const call = util.promisify(db.all.bind(db)) as any;
    const inventories = await call(SQLquery.SQL, ...SQLquery.params);
    db.close();
    return inventories;
  }

  public async attachFileInventory(inventory: Partial<Inventory>): Promise<boolean> {
    const db = await this.openDb();
    const call = util.promisify(db.run.bind(db)) as any;
    const promises = [];
    if (inventory.files) {
      for (const id of inventory.files) {
        promises.push(call(query.SQL_INSERT_FILE_INVENTORIES, id, inventory.id));
      }
    }
    await Promise.all(promises);
    db.close();
    return true;
  }

  // DETACH FILE INVENTORY
  public async detachFileInventory(inventory: Partial<Inventory>):Promise<void> {
    const files = `(${inventory.files.toString()});`;
    const sql = query.SQL_DELETE_FILE_INVENTORIES + files;
    const db = await this.openDb();
    const call = util.promisify(db.run.bind(db));
    await call(sql);
    db.close();
  }

  public async emptyInventory() {
    const db = await this.openDb();
    const call = util.promisify(db.all.bind(db));
    const emptyInventories = await call(query.SQL_SELECT_INVENTORIES_NOT_HAVING_FILES);
    db.close();
    return emptyInventories;
  }

  public async deleteAllEmpty(id: number[]):Promise<void> {
    const sql = `DELETE FROM inventories WHERE id in (${id.toString()});`;
    const db = await this.openDb();
    const call = util.promisify(db.run.bind(db));
    await call(sql);
    db.close();
  }

  // GET INVENTORY BY ID
  public async get(inventory: Partial<Inventory>) {
    let inventories: any;
    if (inventory.id) {
      inventories = await this.getById(inventory.id);
      const comp = await this.component.get(inventories.cvid);
      const files = await this.getInventoryFiles(inventories);
      inventories.component = comp;
      inventories.files = files;
      return inventories;
    }
    return [];
  }

  public async getById(id: number) {
    const db = await this.openDb();
    const call = util.promisify(db.get.bind(db)) as any;
    const inventory = await call(query.SQL_GET_INVENTORY_BY_ID, id);
    db.close();
    return inventory;
  }

  public async isInventory(inventory: Partial<Inventory>): Promise<Partial<Inventory>> {
    let SQLquery = 'SELECT id FROM inventories WHERE  notes# AND usage=? AND spdxid=? AND cvid=? AND source=\'detected\';';
    SQLquery = SQLquery.replace('#', inventory.notes ? `='${inventory.notes}'` : ' IS NULL');
    const db = await this.openDb();
    const call = util.promisify(db.get.bind(db)) as any;
    const inventoryId = await call(SQLquery, inventory.usage, inventory.spdxid, inventory.cvid);
    db.close();
    return inventoryId;
  }

  public async create(inventory: any) {
    return new Promise<Partial<Inventory>>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.run(
          query.SQL_SCAN_INVENTORY_INSERT,
          inventory.cvid,
          inventory.usage ? inventory.usage : null,
          inventory.notes ? inventory.notes : null,
          inventory.url ? inventory.url : null,
          inventory.spdxid ? inventory.spdxid : null,
          inventory.source ? inventory.source : 'detected',
          async function (this: any, err: any) {
            db.close();
            if (err) throw Error('Unable to create inventory');
            inventory.id = this.lastID;
            resolve(inventory);
          },
        );
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  public async update(inventory: Inventory): Promise<Inventory> {
    const db = await this.openDb();
    const call = util.promisify(db.run.bind(db)) as any;
    await call(query.SQL_UPDATE_INVENTORY, inventory.cvid, inventory.usage, inventory.notes ? inventory.notes : null, inventory.url ? inventory.url : null, inventory.spdxid, inventory.id);
    db.close();
    return inventory;
  }

  // GET ALL THE INVENTORIES ATTACHED TO A COMPONENT
  public async getFromComponent() {
    const db = await this.openDb();
    const call = util.promisify(db.all.bind(db));
    const data = await call(query.SQL_SELECT_INVENTORY_COMPONENTS);
    const inventories = this.groupByComponentName(data);
    db.close();
    return inventories;
  }

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
  public async getInventoryFiles(inventory: Partial<Inventory>) {
    const db = await this.openDb();
    const call = util.promisify(db.all.bind(db)) as any;
    const files = await call(
      query.SQL_SELECT_ALL_FILES_ATTACHED_TO_AN_INVENTORY_BY_ID,
      `${inventory.id}`,
    );
    db.close();
    return files;
  }

  public async delete(inventory: Partial<Inventory>): Promise<boolean> {
    const db = await this.openDb();
    const call = util.promisify(db.run.bind(db)) as any;
    await call(query.SQL_SET_RESULTS_TO_PENDING_BY_INVID_PURL_VERSION, inventory.id);
    await call(query.SQL_DELETE_INVENTORY_BY_ID, inventory.id);
    db.close();
    return true;
  }

  public async deleteDirtyFileInventories(id: number[]) {
    const db = await this.openDb();
    const call = util.promisify(db.run.bind(db));
    const dirtyInventories = await call(`DELETE FROM file_inventories WHERE fileId IN (${id.toString()});`);
    db.close();
    return dirtyInventories;
  }

  public async createBatch(inventories: Array<Partial<Inventory>>) {
    return new Promise<Array<Inventory>>(async (resolve, reject) => {
      try {
        const inv: any = [];
        const db = await this.openDb();
        db.serialize(() => {
          db.run('begin transaction');
          for (let i = 0; i < inventories.length; i += 1) {
            db.run(
              query.SQL_SCAN_INVENTORY_INSERT,
              inventories[i].cvid,
              inventories[i].usage ? inventories[i].usage : 'n/a',
              inventories[i].notes ? inventories[i].notes : null,
              inventories[i].url ? inventories[i].url : 'n/a',
              inventories[i].spdxid ? inventories[i].spdxid : 'n/a',
              'detected',
              function (this: any, err: any) {
                inventories[i].id = this.lastID;
                inv.push(inventories[i]);
              },
            );
          }
          db.run('commit', (err: any) => {
            db.close();
            if (err) throw err;
            resolve(inv);
          });
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  public async attachFileInventoryBatch(inventoryFiles: any): Promise<boolean> {
    const SQLQuery = query.SQL_INSERT_FILE_INVENTORIES_BATCH.replace('?', inventoryFiles.invFiles);
    const db = await this.openDb();
    const call = util.promisify(db.run.bind(db));
    await call(SQLQuery);
    db.close();
    return true;
  }

  public async deleteDirtyDependencyInventories(): Promise<void> {
    const sql = `DELETE FROM inventories WHERE cvid IN(
          SELECT cv.id FROM component_versions cv WHERE NOT EXISTS (SELECT 1 FROM dependencies WHERE purl = cv.purl AND version = cv.version) ORDER BY cv.id) AND source='declared' ;`;
    const db = await this.openDb();
    const call = util.promisify(db.run.bind(db));
    await call(sql);
    db.close();
  }
}
