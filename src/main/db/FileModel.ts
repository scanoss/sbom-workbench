import log from 'electron-log';
import { Querys } from './querys_db';
import { File } from '../../api/types';
import { InventoryModel } from './InventoryModel';
import { Model } from './Model';
import { QueryBuilder } from '../queryBuilder/QueryBuilder';

const query = new Querys();

export class FileModel extends Model {
  inventory: InventoryModel;

  constructor(path: string) {
    super(path);
    this.inventory = new InventoryModel(path);
  }

  public async get(file: Partial<File>) {
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

  public getAll(builder?: QueryBuilder): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      try {
        let SQLquery = `SELECT f.fileId AS id,f.type,f.path,f.identified,f.ignored,r.matched,r.idtype AS type,r.lines,r.oss_lines,r.file_url,fi.inventoryid, r.license, r.component AS componentName, r.url,comp.purl,comp.version 
        FROM files f LEFT JOIN results r ON r.fileId=f.fileId LEFT JOIN component_versions comp ON
        comp.purl = r.purl AND comp.version = r.version
       LEFT JOIN file_inventories fi ON fi.fileId=f.fileId #FILTER ;`;

        const filter = builder?.getSQL() ? `WHERE ${builder.getSQL().toString()}` : '';
        const params = builder?.getFilters() ? builder.getFilters() : [];
        SQLquery = SQLquery.replace('#FILTER', filter);
        const db = await this.openDb();
        db.all(SQLquery, ...params, (err: any, file: any) => { 
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
        db.serialize(() => {
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
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          db.run('begin transaction');
          data.forEach((d) => {
            db.run('INSERT INTO FILES(path,type) VALUES(?,?)', d.path, d.type);
          });
          db.run('commit', (err: any) => {
            if (err) throw err;
            db.close();
            resolve();
          });
        });
      } catch (error) {
        log.error(error);
        reject(new Error('ERROR INSERTING FILES'));
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
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        let SQLquery = '';
        if (path) SQLquery = `UPDATE files SET dirty=${dirty} WHERE path IN (${path});`;
        else SQLquery = `UPDATE files SET dirty=${dirty};`;
        db.run(SQLquery, (err: any) => {
          if (err) throw err;
          db.close();
          resolve();
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
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.run(`DELETE FROM files WHERE dirty=1;`, (err: any) => {
          db.close();
          if (err) throw err;
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  public async getClean() {
    return new Promise<Array<any>>(async (resolve, reject) => {
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
    return new Promise<Array<any>>(async (resolve, reject) => {
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
