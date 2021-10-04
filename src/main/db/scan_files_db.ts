/* eslint-disable no-await-in-loop */
/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable prettier/prettier */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-syntax */

import { Querys } from './querys_db';
import { Db } from './db';
import { Component, Files } from '../../api/types';
import { ComponentDb } from './scan_component_db';
import { InventoryDb } from './scan_inventory_db';

const query = new Querys();

export class FilesDb extends Db {
  component: ComponentDb;

  inventory: InventoryDb;

  constructor(path: string) {
    super(path);
    this.component = new ComponentDb(path);
    this.inventory = new InventoryDb(path);
  }

  get(file: Partial<Files>) {
    return new Promise(async (resolve, reject) => {
      try {
        let result: any;
        if (file.path) result = await this.getByPath(file);
        else resolve([]);

        if (result !== undefined) resolve(result);
      } catch (error) {
        reject(new Error('Unable to retrieve file'));
      }
    });
  }

  // GET ALL FILES FOR A COMPONENT
  async getFilesComponent(data: Partial<Component>) {
    return new Promise(async (resolve, reject) => {
      let result;
      try {
        if (data.purl && data.version)
          result = await this.getByPurlVersion(data);
        else result = await this.getByPurl(data);     
        resolve(result);
      } catch (error) {
        console.log(error);
      }
    });
  }

  private async getByPurl(data: Partial<Component>) {
    return new Promise(async (resolve, reject) => {
      const self = this;
      try {
        const db = await this.openDb();
        db.all(
          query.SQL_SELECT_FILES_FROM_PURL,
          data.purl,
          async function (err: any, file: any) {
            db.close();
            if (!err) {
              const components: any = await self.component.getAll({
                purl: data.purl,
                version: data.version,
              });
              const inventories: any = await self.inventory.getAll({});
              const index = inventories.reduce((acc, inventory) => {
                acc[inventory.id] = inventory;
                return acc;
              }, {});
              for (let i = 0; i < file.length; i += 1) {
                file[i].component = components.find(
                  (component) => file[i].version === component.version
                );
                if (file[i].inventoryid)
                  file[i].inventory = index[file[i].inventoryid];
              }
              resolve(file);
            } else resolve([]);
          }
        );
      } catch (error) {
        console.log(error);
      }
    });
  }

  private async getByPurlVersion(data: Partial<Component>) {
    return new Promise(async (resolve, reject) => {
      const self = this;
      try {
        const db = await this.openDb();
        db.all(query.SQL_SELECT_FILES_FROM_PURL_VERSION,data.purl,data.version,async function (err: any, file: any){
          db.close();
          if (!err) {
            const comp = await self.component.getAll({ purl: data.purl,version: data.version });
            const inventories: any = await self.inventory.getAll({});
            const index = inventories.reduce((acc, inventory) => {
                acc[inventory.id] = inventory;
                return acc;
              }, {});
            for (let i = 0; i < file.length; i += 1) {
                file[i].component = comp;
                if (file[i].inventoryid)
                  file[i].inventory = index[file[i].inventoryid];
              }
            resolve(file);
          } else resolve([]);
        });
      } catch (error) {
        console.log(error);
      }
    });
  }

  ignored(files: number[]) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const ignoredFilesSQL = `${
        query.SQL_UPDATE_IGNORED_FILES}(${files.toString()});`;       
        db.serialize(function () {
          db.run('begin transaction');
          db.run(ignoredFilesSQL);
          db.run('commit', () => {
            db.close();
            resolve(true);
          });
        });
      } catch (error) {
        reject(new Error('Ignore files were not successfully retrieved'));
      }
    });
  }

  private getByPath(file: Partial<File>) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.get(
            query.SQL_GET_FILE_BY_PATH,
            file.path,
            (err: any, data: any) => {
              if (data.identified === 0 && data.ignored === 0) {
                data.pending = 1;
              } else {
                data.pending = 0;
              }
              db.close();
              if (err) resolve(undefined);
              else resolve(data);
            }
          );
        });
      } catch (error) {
        reject(new Error('File were not successfully retrieved'));
      }
    });
  }
}
