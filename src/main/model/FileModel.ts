import log from 'electron-log';
import { FileDTO } from "@api/dto";
import { Querys } from './querys_db';
import { InventoryModel } from './InventoryModel';
import { Model } from './Model';
import { QueryBuilder } from './queryBuilder/QueryBuilder';

const query = new Querys();

export class FileModel extends Model {
  public static readonly entityMapper = {
    path: 'f.path',
    purl: 'comp.purl',
    version: 'comp.version',
    source: 'comp.source',
    id: 'fileId',
  };

  inventory: InventoryModel;

  constructor(path: string) {
    super(path);
    this.inventory = new InventoryModel(path);
  }

  public async get(queryBuilder: QueryBuilder) {
    return new Promise<FileDTO>(async (resolve, reject) => {
      try {
        const SQLquery = this.getSQL(queryBuilder, `SELECT f.fileId, f.path,(CASE WHEN f.identified=1 THEN 'IDENTIFIED' WHEN f.identified=0 AND f.ignored=0 THEN 'PENDING' ELSE 'ORIGINAL' END) AS status, f.type FROM files f #FILTER;`, this.getEntityMapper());
        const db = await this.openDb();
        db.get(SQLquery.SQL, ...SQLquery.params, (err: any, file: FileDTO) => {
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

  public getAll(queryBuilder?: QueryBuilder): Promise<any[]> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const SQLquery = this.getSQL(queryBuilder, query.SQL_GET_ALL_FILES, this.getEntityMapper());
        const db = await this.openDb();
        db.all(SQLquery.SQL, ...SQLquery.params, (err: any, file: any) => {
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

  public updateFileType(fileIds: number[], fileType: string) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const SQLquery = `UPDATE files SET type=? WHERE fileId IN (${fileIds.toString()});`;
        db.run(SQLquery,fileType, (err: any) => {
          if (err) throw err;
          db.close();
          resolve();
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  public getSummary() {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.get(`SELECT COUNT(*) as totalFiles , (SELECT COUNT(*) FROM files WHERE type='MATCH') AS matchFiles,
                (SELECT COUNT(*) FROM files WHERE type='FILTERED') AS filterFiles,
                (SELECT COUNT(*) FROM files WHERE type='NO-MATCH') AS  noMatchFiles, (SELECT COUNT(*) FROM files f WHERE f.type="MATCH" AND f.identified=1) AS scannedIdentified,
                (SELECT COUNT(*) AS detectedIdentifiedFiles FROM files f WHERE f.identified=1) AS totalIdentified,
                (SELECT COUNT(*) AS detectedIdentifiedFiles FROM files f WHERE f.ignored=1) AS original,
                (SELECT COUNT(*) AS pending FROM files f WHERE f.identified=0 AND f.ignored=0 AND f.type="MATCH") AS pending  FROM files;`, (err: any, data: any) => {
          db.close();
          if (err) throw err;
          else resolve(data);
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  public getEntityMapper(): Record<string, string> {
    return FileModel.entityMapper;
  }
}
