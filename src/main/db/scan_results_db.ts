/* eslint-disable import/no-cycle */
/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-syntax */
import log from 'electron-log';
import { Querys } from './querys_db';
import { Db } from './db';
import { utilDb } from './utils_db';
import { ComponentDb } from './scan_component_db';

const query = new Querys();

export class ResultsDb extends Db {
  component: ComponentDb;

  constructor(path: string) {
    super(path);
    this.component = new ComponentDb(path);
  }

  insertFromFileReScan(resultPath: string,files:any) {
    return new Promise(async (resolve) => {
      try {
        const self = this;
        const result: Record<any, any> = await utilDb.readFile(resultPath);
        const db = await this.openDb();
        db.serialize(function () {
          db.run('begin transaction');
          let data: any;
          for (const [key, value] of Object.entries(result)) {
            for (let i = 0; i < value.length; i += 1) {
              const filePath = key;
              data = value[i];
              if (data.id !== 'none') self.insertResultBulkReScan(db, data, files[filePath]);
            }
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

  // INSERT RESULTS FROM FILE
  insertFromFile(resultPath: string, files: any) {
    return new Promise(async (resolve) => {
      try {
        const self = this;
        const result: Record<any, any> = await utilDb.readFile(resultPath);
        const db = await this.openDb();
        db.serialize(function () {
          db.run('begin transaction');
          let data: any;
          for (const [key, value] of Object.entries(result)) {
            for (let i = 0; i < value.length; i += 1) {
              const filePath = key;
              data = value[i];
              if (data.id !== 'none') self.insertResultBulk(db, data, files[filePath]);
            }
          }
          db.run('commit', (err: any) => {
            if (err) throw err;
            db.close();
            resolve(true);
          });
        });
      } catch (error) {
        log.error(error);
        resolve(false);
      }
    });
  }

  async count() {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.get('SELECT COUNT(*)as count FROM results;', function (err: any, result: any) {
          if (err) throw err;
          db.close();
          resolve(result.count);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async updateDirty(value: number) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.run('begin transaction');
          db.run(`UPDATE results SET dirty=${value} WHERE id IN (SELECT id FROM results);`);
          db.run('commit', (err: any) => {
            db.close();
            if (err) throw err;
            resolve(true);
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async deleteDirty() {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.run('begin transaction');
          db.run(`DELETE FROM results WHERE dirty=1;`);
          db.run('commit', (err: any) => {
            db.close();
            if (err) throw err;
            resolve(true);
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async insertFiltered(path: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.run(
            query.SQL_INSERT_RESULTS,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            'file',
            null,
            null,
            path,
            0,
            0,
            null,
            'filtered',
            function (this: any, err: any) {
              if (err) throw err;
              db.close();
              resolve(this.lastID);
            }
          );
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  private insertResultBulk(db: any, data: any, fileId: number) {
    const licenseName = data.licenses && data.licenses[0] ? data.licenses[0].name : null;
    db.run(
      query.SQL_INSERT_RESULTS,
      data.file_hash,
      data.vendor,
      data.component,
      data.version,
      data.latest,
      licenseName,
      data.url,
      data.lines,
      data.oss_lines,
      data.matched,
      data.file,
      data.id,
      data.url_hash,
      data.purl ? data.purl[0] : ' ',
      fileId,
      data.file_url,
      'engine'
    );
  }

  private async insertResultBulkReScan(db: any, data: any,fileId: number) {
    const self = this;
    const sQuery = `SELECT id FROM results WHERE md5_file ${
      data.file_hash ? `='${data.file_hash}'` : 'IS NULL'
    } AND vendor ${data.vendor ? `='${data.vendor}'` : 'IS NULL'} AND component ${
      data.component ? `='${data.component}'` : 'IS NULL'
    } AND version ${data.version ? `='${data.version}'` : 'IS NULL'} AND latest_version ${
      data.latest ? `='${data.latest}'` : 'IS NULL'
    } AND license ${data.licenses && data.licenses[0] ? `='${data.licenses[0].name}'` : 'IS NULL'} AND url ${
      data.url ? `='${data.url}'` : 'IS NULL'
    } AND lines ${data.lines ? `='${data.lines}'` : 'IS NULL'} AND oss_lines ${
      data.oss_lines ? `='${data.oss_lines}'` : 'IS NULL'
    } AND matched ${data.matched ? `='${data.matched}'` : 'IS NULL'} AND filename ${
      data.file ? `='${data.file}'` : 'IS NULL'
    } AND md5_comp ${data.url_hash ? `='${data.url_hash}'` : 'IS NULL'} AND purl = '${
      data.purl ? data.purl[0] : ' '
    }' AND fileId = ${fileId}  AND file_url ${data.file_url ? `='${data.file_url}'` : 'IS NULL'} AND idtype='${
      data.id
    }' ; `;

    db.serialize(function () {
      db.get(sQuery, function (err: any, result: any) {
        if (result !== undefined) {
          db.run('UPDATE results SET dirty=0 WHERE id=?', result.id);
        }else{
          self.insertResultBulk(db, data, fileId);
        }

      });
    });
    //     if (result === undefined) {
    //       db.get(
    //         `SELECT id FROM results WHERE file_path='${filePath}' AND source='nomatch' AND identified=1 OR ignored=1;`,
    //         (err: any, resultNoMatch: any) => {
    //           if (resultNoMatch !== undefined) db.run('UPDATE results SET dirty=0 WHERE id=?', resultNoMatch.id);
    //           else self.insertResultBulk(db, data, filePath);
    //         }
    //       );
    //     } else {
    //       db.run('UPDATE results SET dirty=0 WHERE id=?', result.id);
    //     }
    //   });
    // });
  }

  // CONVERT ARRAY TO RESULTS FORMAT
  convertToResultsFormat(input: any) {
    return new Promise((resolve, reject) => {
      if (input === undefined || input.length === 0) {
        reject(new Error('input is empty'));
      }
      const formattedData = {};
      for (let i = 0; i < input.length; i += 1) {
        for (const obj of input[i]) {
          const newKey = obj.path;
          formattedData[newKey] = [];
          delete obj.path;
          formattedData[newKey].push(obj);
        }
      }
      resolve(formattedData);
    });
  }

  // GET RESULT
  private async getResult(path: string) {
    const db = await this.openDb();
    return new Promise<any>(async (resolve) => {
      db.all(query.SQL_SCAN_SELECT_FILE_RESULTS, path, (err: any, data: any) => {
        db.close();
        if (err) resolve([]);
        else resolve(data);
      });
    });
  }

  // GET RESULT
  async getNoMatch(path: string) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.get(query.SQL_SCAN_SELECT_FILE_RESULTS_NO_MATCH, path, (err: any, data: any) => {
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

  // GET RESULTS
  get(path: string) {
    let results: any;
    return new Promise(async (resolve, reject) => {
      try {
        results = await this.getResult(path);
        for (let i = 0; i < results.length; i += 1) {
          const comp = await this.component.getAll(results[i]);
          results[i].component = comp;
        }
        resolve(results);
      } catch (error) {
        log.error(error);
        reject(new Error('Unable to retrieve results'));
      }
    });
  }

  async updateResult(path: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.run(query.SQL_UPDATE_RESULTS_IDTYPE_FROM_PATH, 'nomatch', path, function (this: any, err: any) {
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

  public async restore(files: number[]) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          const resultsid = `(${files.toString()});`;
          const sqlRestoreIdentified = query.SQL_RESTORE_IDENTIFIED_FILE_SNIPPET + resultsid;
          // const sqlRestoreNoMatch = query.SQL_RESTORE_NOMATCH_FILE + resultsid;
          // const sqlRestoreFiltered = query.SQL_RESTORE_FILTERED_FILE + resultsid;
          db.run('begin transaction');
          db.run(sqlRestoreIdentified);
          // db.run(sqlRestoreNoMatch);
          // db.run(sqlRestoreFiltered);
          db.run('commit', (err: any) => {
            if (err) throw err;
            db.close();
            resolve(true);
          });
        });
      } catch (error) {
        log.error(error);
        reject(new Error('Unignore files were not successfully retrieved'));
      }
    });
  }

  public async getDirty() {
    const db = await this.openDb();
    return new Promise<number[]>(async (resolve) => {
      db.all(`SELECT id FROM results WHERE dirty=1;`, (err: any, data: any) => {
        db.close();
        if (err) throw err;
        if (data === undefined) resolve([]);
        resolve(data.map((item: any) => item.id));
      });
    });
  }

  public async getNotOriginal(ids: number[]) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const queryGetNotOriginal = `SELECT * FROM results WHERE id in (${ids.toString()}) AND source!='engine';`;
        db.get(queryGetNotOriginal, (err: any, data: any) => {
          db.close();
          if (err) throw new Error('Unable to get result by id');
          else resolve(data);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  public async getSummaryByids(ids: number[]) {    
    return new Promise<Array<any>>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          const sqlQuerySummary = query.SQL_GET_SUMMARY_BY_RESULT_ID.replace('#values', `(${ids.toString()})`);
          db.all(sqlQuerySummary, (err: any, data: any) => {
            db.close();
            if (err) throw err;
            else resolve(data);
          });
        });
      } catch (error) {
        log.error(error);
        reject(new Error('Unable to retrieve results'));
      }
    });
  }

  public async getResultsRescan() {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(query.SQL_GET_RESULTS_RESCAN, (err: any, data: any) => {
          db.close();
          if (err) throw new Error('Unable to get result by id');
          else resolve(data);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  public async getFilesInFolder(folder: string) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        let SQLquery = '';
        SQLquery =
          folder === '/'
            ? query.SQL_GET_RESULTS_IN_FOLDER.replace('?', `${folder}%`)
            : (SQLquery = query.SQL_GET_RESULTS_IN_FOLDER.replace('?', `${folder}/%`));
        db.all(SQLquery, (err: any, data: any) => {
          db.close();
          if (err) throw new Error('[ DB ERROR ] : files in folder');
          else resolve(data);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  public async updateFiltered(path: string) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const SQLquery = `UPDATE results SET dirty=0 WHERE file_path IN (${path}) AND identified=1 OR ignored=1;`;
        db.run(SQLquery, (err: any) => {
          if (err) throw err;
          db.close();
          resolve(true);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
