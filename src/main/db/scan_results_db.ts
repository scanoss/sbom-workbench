/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-syntax */
import { Querys } from './querys_db';
import { Db } from './db';
import { UtilsDb } from './utils_db';

const utilsDb = new UtilsDb();
const query = new Querys();

export class ResultsDb extends Db {
  constructor() {
    super();
  }

  // INSERT RESULTS
  async insert(resultPath: string) {
    try {
      const result: Record<any, any> = await utilsDb.readFile(resultPath);
      const db = await this.openDb();
      let data: any;
      for (const [key, value] of Object.entries(result)) {
        for (let i = 0; i < value.length; i += 1) {
          data = value[i];
          if (data.id !== 'none') {
            await this.insertResult(db, data);
          }
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  private insertResult(db: any, data: any) {
    return new Promise(async (resolve) => {
      const stmt = db.prepare(query.SQL_INSERT_RESULTS);
      db.serialize(function () {
        const licenseName =
          data.licenses && data.licenses[0] ? data.licenses[0].name : 'n/a';
        stmt.run(
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
          data.purl ? data.purl[0] : ' '
        );
      });
      stmt.finalize();
      resolve(true);
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
  private async getResult(path: string) {
    const db = await this.openDb();
    return new Promise<any>(async (resolve, reject) => {
      db.all(
        query.SQL_SCAN_SELECT_FILE_RESULTS,
        `%${path}`,
        (err: any, data: any) => {
          if (data === !null) {
            resolve(data);
          } else {
            reject(err);
          }
        }
      );
    });
  }

  // GET RESULTS
  async get(paths: any) {
    const results: any[] = [];
    return new Promise<any[]>(async (resolve, reject) => {
      // const db:any = await this.db;
      for (const path of paths.files) {
        const result: any = await this.getResult(path.path);
        if (results) results.push(result);
        else reject(new Error('{}'));
      }
      resolve(results);
    });
  }
}
