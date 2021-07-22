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
import { UtilsDb } from './utils_db';


const utilsDb = new UtilsDb();
const query = new Querys();

interface Summary {
  identified: number;
  ignored: number;
  pending: number;
}

export class ResultsDb extends Db {
  constructor(path: string) {
    super(path);
  }

  // INSERT RESULTS FROM FILE
  insertFromFile(resultPath: string) {
    return new Promise(async (resolve) => {
      try {
        const self = this;
        const result: Record<any, any> = await utilsDb.readFile(resultPath);
        const db = await this.openDb();
        db.serialize(function () {
          db.run('begin transaction');
          let data: any;
          for (const [key, value] of Object.entries(result)) {
            for (let i = 0; i < value.length; i += 1) {
              data = value[i];
              if (data.id !== 'none') self.insertResult(db, data);
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

  // INSERT RESULTS FROM FILE
  insertFromJSON(json: string) {
    return new Promise(async (resolve) => {
      try {
        const self = this;
        const db = await this.openDb();
        db.serialize(function () {
          db.run('begin transaction');
          let data: any;
          for (const [key, value] of Object.entries(json)) {
            for (let i = 0; i < value.length; i += 1) {
              data = value[i];
              if (data.id !== 'none') self.insertResult(db, data);
            }
          }
          db.run('commit');
          db.close();
          resolve(true);
        });
      } catch {
        resolve(false);
      }
    });
  }

  private insertResult(db: any, data: any) {
    const licenseName = data.licenses && data.licenses[0] ? data.licenses[0].name : 'NULL';
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
      data.purl ? data.purl[0] : ' '
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

  async getUnique() {
    try {
      const db = await this.openDb();
      return await new Promise<any>(async (resolve, reject) => {
        db.all('SELECT DISTINCT purl,version,license,component,url FROM results;', (err: any, data: any) => {
          db.close();
          if (!err) resolve(data);
          else resolve([]);
        });
      });
    } catch (error) {
      console.log(error);
    }
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

  // GET RESULTS
  get(paths: string[]) {
    let results: any;
    return new Promise(async (resolve, reject) => {
      try {      
          results = await this.getResult(paths[0]);
          resolve(results);        
      } catch (error) {
        reject(new Error('Unable to retrieve results'));
      }
    });
  }

  private identifiedSummary(db: any, data: any) {
    return new Promise<number>(async (resolve) => {
      db.get(query.SQL_COMP_SUMMARY_IDENTIFIED, data.purl, data.version, async (err: any, comp: any) => {
        if (err) resolve(0);
        if (comp !== undefined) resolve(comp.identified);
      });
    });
  }

  private ignoredSummary(db: any, data: any) {
    return new Promise<number>(async (resolve) => {
      db.get(query.SQL_COMP_SUMMARY_IGNORED, data.purl, data.version, async (err: any, comp: any) => {
        if (err) resolve(0);
        if (comp !== undefined) resolve(comp.ignored);
      });
    });
  }

  private pendingSummary(db: any, data: any) {
    return new Promise<number>(async (resolve) => {
      db.get(query.SQL_COMP_SUMMARY_PENDING, data.purl, data.version, async (err: any, comp: any) => {
        if (err) resolve(0);
        if (comp !== undefined) resolve(comp.pending);
      });
    });
  }

  summary(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const summary: Summary = {
          ignored: 0,
          identified: 0,
          pending: 0,
        };
        const db = await this.openDb();
        summary.identified = await this.identifiedSummary(db, data);
        summary.ignored = await this.ignoredSummary(db, data);
        summary.pending = await this.pendingSummary(db, data);
        db.close();
        resolve(summary);
      } catch (error) {
        reject(error);
      }
    });
  }
}
