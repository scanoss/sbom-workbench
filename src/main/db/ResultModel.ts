/* eslint-disable @typescript-eslint/no-this-alias */

import log from 'electron-log';
import { Querys } from './querys_db';
import { Model } from './Model';
import { utilModel } from './UtilModel';
import { ComponentModel } from './ComponentModel';
import { licenseHelper } from '../helpers/LicenseHelper';
import { QueryBuilder } from '../queryBuilder/QueryBuilder';

const query = new Querys();

export class ResultModel extends Model {
  component: ComponentModel;

  constructor(path: string) {
    super(path);
    this.component = new ComponentModel(path);
  }

  insertFromFileReScan(resultPath: string, files: any) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const self = this;
        const result: Record<any, any> = await utilModel.readFile(resultPath);
        const db = await this.openDb();
        db.serialize(() => {
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
            resolve();
          });
        });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  // INSERT RESULTS FROM FILE
  insertFromFile(resultPath: string, files: any) {
    return new Promise(async (resolve) => {
      try {
        const self = this;
        const result: Record<any, any> = await utilModel.readFile(resultPath);
        const db = await this.openDb();
        db.serialize(() => {
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
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          db.run('begin transaction');
          db.run(`UPDATE results SET dirty=${value} WHERE id IN (SELECT id FROM results);`);
          db.run('commit', (err: any) => {
            db.close();
            if (err) throw err;
            resolve();
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async deleteDirty() {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          db.run('begin transaction');
          db.run(`DELETE FROM results WHERE dirty=1;`);
          db.run('commit', (err: any) => {
            db.close();
            if (err) throw err;
            resolve();
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private insertResultBulk(db: any, data: any, fileId: number) {
    let licenses: string;
    if (data.licenses.length >= 0 && data.licenses)
      licenses = licenseHelper.getStringOfLicenseNameFromArray(data.licenses);
    else licenses = null;
    db.run(
      query.SQL_INSERT_RESULTS,
      data.file_hash,
      data.vendor,
      data.component,
      data.version,
      data.latest,
      licenses,
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

  private async insertResultBulkReScan(db: any, data: any, fileId: number) {
    const self = this;
    let licenses: string;
    if (data.licenses.length >= 0) licenses = licenseHelper.getStringOfLicenseNameFromArray(data.licenses);
    else licenses = null;

    const SQLquery = `SELECT id FROM results WHERE md5_file ${
      data.file_hash ? `='${data.file_hash}'` : 'IS NULL'
    } AND vendor ${data.vendor ? `='${data.vendor}'` : 'IS NULL'} AND component ${
      data.component ? `='${data.component}'` : 'IS NULL'
    } AND version ${data.version ? `='${data.version}'` : 'IS NULL'} AND latest_version ${
      data.latest ? `='${data.latest}'` : 'IS NULL'
    } AND license ${licenses ? `='${licenses}'` : 'IS NULL'} AND url ${
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
    db.serialize(() => {
      db.get(SQLquery, function (err: any, result: any) {
        if (result !== undefined) db.run('UPDATE results SET dirty=0 WHERE id=?', result.id);
        else self.insertResultBulk(db, data, fileId);
      });
    });
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
  public async getFromPath(path: string) {
    const db = await this.openDb();
    return new Promise<any>(async (resolve) => {
      db.all(query.SQL_SCAN_SELECT_FILE_RESULTS, path, (err: any, data: any) => {
        db.close();
        if (err) resolve([]);
        else resolve(data);
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

  public getResultsPreLoadInventory(builder: QueryBuilder) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        let SQLquery = 'SELECT f.fileId AS id,r.source,r.idtype AS usage,r.component,r.version,r.license AS spdxid,r.url,r.purl,f.type FROM files f INNER JOIN results r ON f.fileId=r.fileId LEFT JOIN component_versions comp ON comp.purl=r.purl AND comp.version=r.version #FILTER';
        const filter = builder ? `WHERE ${builder.getSQL().toString()}` : '';
        const params = builder ? builder.getFilters() : [];
        SQLquery = SQLquery.replace('#FILTER', filter);
        const db = await this.openDb();
        db.all(SQLquery, ...params, async (err: any, data: any) => {
          db.close();
          if (err) throw err;
          else {
            resolve(data);
          }
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }  
}
