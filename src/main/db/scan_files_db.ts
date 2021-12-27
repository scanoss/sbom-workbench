import log from 'electron-log';
import { Querys } from './querys_db';
import { Db } from './db';
import { Component, Files, IFilesDb } from '../../api/types';
import { ComponentDb } from './scan_component_db';
import { InventoryDb } from './scan_inventory_db';

const query = new Querys();

export class FilesDb extends Db implements IFilesDb {
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
        log.error(error);
        reject(new Error('Unable to retrieve file'));
      }
    });
  }

  // GET ALL FILES FOR A COMPONENT
  public async getFilesComponent(data: Partial<Component>, params: any) {
    return new Promise(async (resolve, reject) => {
      let result;
      try {
        if (data.purl && data.version) result = await this.getByPurlVersion(data, params ? params.path : null);
        else result = await this.getByPurl(data, params ? params.path : null);
        resolve(result);
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  public async getByPurl(data: Partial<Component>, path: string) {
    return new Promise(async (resolve, reject) => {
      try {
        let SQLquery = '';
        let params = [];
        if (!path) {
          SQLquery = query.SQL_SELECT_FILES_FROM_PURL;
          params = [data.purl];
        } else {
          SQLquery = query.SQL_SELECT_FILES_FROM_PURL_PATH;
          params = [data.purl, `${path}/%`];
        }
        const db = await this.openDb();
        db.all(SQLquery, ...params, async function (err: any, file: any) {
          db.close();
          if (err) throw err;
          resolve(file);
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  public async getByPurlVersion(data: Partial<Component>, path: string) {
    return new Promise(async (resolve, reject) => {
      try {
        let SQLquery = '';
        let params = [];
        if (!path) {
          SQLquery = query.SQL_SELECT_FILES_FROM_PURL_VERSION;
          params = [data.purl, data.version];
        } else {
          SQLquery = query.SQL_SELECT_FILES_FROM_PURL_VERSION_PATH;
          params = [data.purl, data.version, `${path}/%`];
        }
        const db = await this.openDb();
        db.all(SQLquery, ...params, async function (err: any, file: any) {
          db.close();
          if (err) throw err;
          resolve(file);
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  ignored(files: number[]) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const ignoredFilesSQL = `${query.SQL_UPDATE_IGNORED_FILES}(${files.toString()});`;
        db.serialize(function () {
          db.run('begin transaction');
          db.run(ignoredFilesSQL);
          db.run('commit', (err: any) => {
            if (err) throw err;
            db.close();
            resolve(true);
          });
        });
      } catch (error) {
        log.error(error);
        reject(new Error('Ignore files were not successfully retrieved'));
      }
    });
  }

  private getByPath(file: Partial<File>) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.get(query.SQL_GET_FILE_BY_PATH, file.path, (err: any, data: any) => {
            if (data.identified === 0 && data.ignored === 0) {
              data.pending = 1;
            } else {
              data.pending = 0;
            }
            db.close();
            if (err) throw err;
            else resolve(data);
          });
        });
      } catch (error) {
        log.error(error);
        reject(new Error('File were not successfully retrieved'));
      }
    });
  }

  public async insertFiles(data: Array<any>) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.run('begin transaction');
          data.forEach((d) => {
            db.run('INSERT INTO FILES(path,type) VALUES(?,?)', d.path, d.type);
          });
          db.run('commit', (err: any) => {
            if (err) throw err;
            db.close();
            resolve(true);
          });
        });
      } catch (error) {
        log.error(error);
        reject(new Error('ERROR INSERTING FILES'));
      }
    });
  }

  public async getFiles() {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all('SELECT * FROM files', (err: any, files: any) => {
          if (err) throw err;
          db.close();
          resolve(files);
        });
      } catch (error) {
        log.error(error);
        reject(new Error('ERROR ATTACHING FILES TO RESULTS'));
      }
    });
  }

  public async getIdFromPath(path: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.get('SELECT fileId AS id FROM files WHERE path=?;', path, (err: any, id: any) => {
          if (err) throw err;
          db.close();
          resolve(id);
        });
      } catch (error) {
        log.error(error);
        reject(new Error('ERROR ATTACHING FILES TO RESULTS'));
      }
    });
  }

  public async setDirty(dirty: number, path?: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        let SQLquery = '';
        if (path) SQLquery = `UPDATE files SET dirty=${dirty} WHERE path IN (${path});`;
        else SQLquery = `UPDATE files SET dirty=${dirty};`;
        db.run(SQLquery, (err: any) => {
          if (err) throw err;
          db.close();
          resolve(true);
        });
      } catch (error) {
        log.error(error);
        reject(new Error('ERROR SETTING FILES DIRTY'));
      }
    });
  }

  public async getDirty() {
    const db = await this.openDb();
    return new Promise<number[]>(async (resolve) => {
      db.all(`SELECT fileId AS id FROM files WHERE dirty=1;`, (err: any, data: any) => {
        db.close();
        if (err) throw err;
        if (data === undefined) resolve([]);
        resolve(data.map((item: any) => item.id));
      });
    });
  }

  public async deleteDirty() {
    const db = await this.openDb();
    return new Promise<number[]>(async (resolve) => {
      db.all(`DELETE FROM files WHERE dirty=1;`, (err: any, data: any) => {
        db.close();
        if (err) throw err;
        if (data === undefined) resolve([]);
        resolve(data.map((item: any) => item.id));
      });
    });
  }

  public async getClean() {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all('SELECT * FROM files WHERE dirty=0', (err: any, files: any) => {
          if (err) throw err;
          db.close();
          resolve(files);
        });
      } catch (error) {
        log.error(error);
        reject(new Error('ERROR ATTACHING FILES TO RESULTS'));
      }
    });
  }

  public async getFilesRescan() {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(
          'SELECT f.path,f.identified ,f.ignored ,f.type AS original,(CASE WHEN  f.identified=0 AND f.ignored=0 THEN 1 ELSE 0 END) as pending FROM files f;',
          (err: any, files: any) => {
            if (err) throw err;
            db.close();
            resolve(files);
          }
        );
      } catch (error) {
        log.error(error);
        reject(new Error('ERROR ATTACHING FILES TO RESULTS'));
      }
    });
  }

  public async restore(files: number[]) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const filesIds = `(${files.toString()});`;
        const sqlRestoreIdentified = query.SQL_FILE_RESTORE + filesIds;
        db.run(sqlRestoreIdentified, (err: any) => {
          if (err) throw err;
          db.close();
          resolve();
        });
      } catch (error) {
        log.error(error);
        reject(new Error('Unignore files were not successfully retrieved'));
      }
    });
  }

  // UPDATE IDENTIFIED FILES
  identified(ids: number[]) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          const resultsid = `(${ids.toString()});`;
          const sqlUpdateIdentified = query.SQL_FILES_UPDATE_IDENTIFIED + resultsid;
          db.run('begin transaction');
          db.run(sqlUpdateIdentified);
          db.run('commit', (err: any) => {
            if (err) throw Error('Unable to update identified files');
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
}
