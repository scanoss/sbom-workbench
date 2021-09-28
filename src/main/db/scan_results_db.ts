/* eslint-disable import/no-cycle */
/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-syntax */

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

  // INSERT RESULTS FROM FILE
  insertFromFile(resultPath: string) {
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
              self.insertResultBulk(db, data, filePath);
            }
          }
          db.run('commit', () => {
            db.close();
            resolve(true);
          });
        });
      } catch (error) {
        resolve(false);
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
        reject(error);
      }
    });
  }

  private insertResultBulk(db: any, data: any, filePath: string) {
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
      filePath,
      0,
      0,
      data.file_url,
      'engine'
    );
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
    const db = await this.openDb();
    return new Promise<any>(async (resolve) => {
      db.get(query.SQL_SCAN_SELECT_FILE_RESULTS_NO_MATCH, path, (err: any, data: any) => {
        db.close();
        if (err) resolve([]);
        else resolve(data);
      });
    });
  }

  // GET RESULTS
  getAll(path: string) {
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
        reject(error);
      }
    });
  }

  async restore(files: number[]) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          const resultsid = `(${files.toString()});`;
          const sqlRestoreIdentified = query.SQL_RESTORE_IDENTIFIED_FILE_SNIPPET + resultsid;
          const sqlRestoreNoMatch = query.SQL_RESTORE_NOMATCH_FILE + resultsid;
          const sqlRestoreFiltered = query.SQL_RESTORE_FILTERED_FILE + resultsid;
          db.run('begin transaction');
          db.run(sqlRestoreIdentified);
          db.run(sqlRestoreNoMatch);
          db.run(sqlRestoreFiltered);
          db.run('commit', () => {
            db.close();
            resolve(true);
          });
        });
      } catch (error) {
        reject(new Error('Unignore files were not successfully retrieved'));
      }
    });
  }

}
