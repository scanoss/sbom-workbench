import log from 'electron-log';
import util from 'util';
import sqlite3 from 'sqlite3';
import { queries } from '../../querys_db';
import { ComponentModel } from './ComponentModel';
import { Inventory } from '../../../../api/types';
import { ResultModel } from './ResultModel';
import { QueryBuilder } from '../../queryBuilder/QueryBuilder';
import { Model } from '../../Model';

export class InventoryModel extends Model {
  private connection: sqlite3.Database;

  component: ComponentModel;

  results: ResultModel;

  constructor(conn: sqlite3.Database) {
    super();
    this.connection = conn;
    this.component = new ComponentModel(conn);
    this.results = new ResultModel(conn);
  }

  public async getAll(queryBuilder?: QueryBuilder) {
    const SQLquery = this.getSQL(
      queryBuilder,
      queries.SQL_GET_ALL_INVENTORIES,
      { purl: 'c.purl', version: 'c.version', filePath: 'f.path', usage: 'i.usage', source: 'i.source' },
    );
    const call = util.promisify(this.connection.all.bind(this.connection)) as any;
    const inventories = await call(SQLquery.SQL, ...SQLquery.params);
    return inventories;
  }

  public async attachFileInventory(inventory: Partial<Inventory>): Promise<boolean> {
    const call = util.promisify(this.connection.run.bind(this.connection)) as any;
    const promises = [];
    if (inventory.files) {
      for (const id of inventory.files) {
        promises.push(call(queries.SQL_INSERT_FILE_INVENTORIES, id, inventory.id));
      }
    }
    await Promise.all(promises);
    return true;
  }

  // DETACH FILE INVENTORY
  public async detachFileInventory(inventory: Partial<Inventory>):Promise<void> {
    const files = `(${inventory.files.toString()});`;
    const sql = queries.SQL_DELETE_FILE_INVENTORIES + files;
    const call = util.promisify(this.connection.run.bind(this.connection));
    await call(sql);
  }

  public async emptyInventory() {
    const call = util.promisify(this.connection.all.bind(this.connection));
    const emptyInventories = await call(queries.SQL_SELECT_INVENTORIES_NOT_HAVING_FILES);
    return emptyInventories;
  }

  public async deleteAllEmpty(id: number[]):Promise<void> {
    const sql = `DELETE FROM inventories WHERE id in (${id.toString()});`;
    const call = util.promisify(this.connection.run.bind(this.connection));
    await call(sql);
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
    const call = util.promisify(this.connection.get.bind(this.connection)) as any;
    const inventory = await call(queries.SQL_GET_INVENTORY_BY_ID, id);
    return inventory;
  }

  public async isInventory(inventory: Partial<Inventory>): Promise<Partial<Inventory>> {
    let SQLquery = 'SELECT id FROM inventories WHERE  notes# AND usage=? AND spdxid=? AND cvid=? AND source=\'detected\';';
    SQLquery = SQLquery.replace('#', inventory.notes ? `='${inventory.notes}'` : ' IS NULL');
    const call = util.promisify(this.connection.get.bind(this.connection)) as any;
    const inventoryId = await call(SQLquery, inventory.usage, inventory.spdxid, inventory.cvid);
    return inventoryId;
  }

  public async create(inventory: any) {
    return new Promise<Partial<Inventory>>(async (resolve, reject) => {
      try {
        this.connection.run(
          queries.SQL_SCAN_INVENTORY_INSERT,
          inventory.cvid,
          inventory.usage ? inventory.usage : null,
          inventory.notes ? inventory.notes : null,
          inventory.url ? inventory.url : null,
          inventory.spdxid ? inventory.spdxid : null,
          inventory.source ? inventory.source : 'detected',
          async function (this: any, err: any) {
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
    const call = util.promisify(this.connection.run.bind(this.connection)) as any;
    await call(queries.SQL_UPDATE_INVENTORY, inventory.cvid, inventory.usage, inventory.notes ? inventory.notes : null, inventory.url ? inventory.url : null, inventory.spdxid, inventory.id);
    return inventory;
  }

  // GET ALL THE INVENTORIES ATTACHED TO A COMPONENT
  public async getFromComponent() {
    const call = util.promisify(this.connection.all.bind(this.connection));
    const data = await call(queries.SQL_SELECT_INVENTORY_COMPONENTS);
    const inventories = this.groupByComponentName(data);
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
    const call = util.promisify(this.connection.all.bind(this.connection)) as any;
    const files = await call(
      queries.SQL_SELECT_ALL_FILES_ATTACHED_TO_AN_INVENTORY_BY_ID,
      `${inventory.id}`,
    );
    return files;
  }

  public async delete(inventory: Partial<Inventory>): Promise<boolean> {
    const call = util.promisify(this.connection.run.bind(this.connection)) as any;
    await call(queries.SQL_SET_RESULTS_TO_PENDING_BY_INVID_PURL_VERSION, inventory.id);
    await call(queries.SQL_DELETE_INVENTORY_BY_ID, inventory.id);
    return true;
  }

  public async deleteDirtyFileInventories(id: number[]) {
    const call = util.promisify(this.connection.run.bind(this.connection));
    const dirtyInventories = await call(`DELETE FROM file_inventories WHERE fileId IN (${id.toString()});`);
    return dirtyInventories;
  }

  public async createBatch(inventories: Array<Partial<Inventory>>) {
    return new Promise<Array<Inventory>>(async (resolve, reject) => {
      try {
        const inv: any = [];
        this.connection.serialize(() => {
          this.connection.run('begin transaction');
          for (let i = 0; i < inventories.length; i += 1) {
            this.connection.run(
              queries.SQL_SCAN_INVENTORY_INSERT,
              inventories[i].cvid,
              inventories[i].usage ? inventories[i].usage : 'n/a',
              inventories[i].notes ? inventories[i].notes : null,
              inventories[i].url ? inventories[i].url : 'n/a',
              inventories[i].spdxid ? inventories[i].spdxid : 'n/a',
              inventories[i].source,
              function (this: any, err: any) {
                inventories[i].id = this.lastID;
                inv.push(inventories[i]);
              },
            );
          }
          this.connection.run('commit', (err: any) => {
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
    const SQLQuery = queries.SQL_INSERT_FILE_INVENTORIES_BATCH.replace('?', inventoryFiles.invFiles);
    const call = util.promisify(this.connection.run.bind(this.connection));
    await call(SQLQuery);
    return true;
  }

  public async deleteDirtyDependencyInventories(): Promise<void> {
    const sql = `DELETE FROM inventories WHERE cvid IN(
          SELECT cv.id FROM component_versions cv WHERE NOT EXISTS (SELECT 1 FROM dependencies WHERE purl = cv.purl AND version = cv.version) ORDER BY cv.id) AND source='declared' ;`;
    const call = util.promisify(this.connection.run.bind(this.connection));
    await call(sql);
  }
}
