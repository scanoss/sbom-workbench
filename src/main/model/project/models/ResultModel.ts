import * as util from 'util';
import { queries } from '../../querys_db';
import { utilModel } from '../../UtilModel';
import { ComponentModel } from './ComponentModel';
import { licenseHelper } from '../../../helpers/LicenseHelper';
import { QueryBuilder } from '../../queryBuilder/QueryBuilder';
import { IInsertResult, IResultLicense } from '../../interfaces/IInsertResult';
import { QueryBuilderCreator } from '../../queryBuilder/QueryBuilderCreator';
import { Model } from '../../Model';
import sqlite3 from 'sqlite3';


export class ResultModel extends Model {

  private connection: sqlite3.Database;

  public static readonly entityMapper = {
    path: 'f.path',
    source: 'comp.source',
    purl: 'comp.purl',
    version: 'comp.version',
  };

  component: ComponentModel;

  constructor(conn: sqlite3.Database) {
    super();
    this.connection = conn;
    this.component = new ComponentModel(conn);
  }

  insertFromFileReScan(resultPath: string, files: any): Promise<IInsertResult> {
    return new Promise<IInsertResult>(async (resolve, reject) => {
      try {
        const self = this;
        const resultLicense: any = {};
        const result: Record<any, any> = await utilModel.readFile(resultPath);
        this.connection.serialize(async () => {
          this.connection.run('begin transaction');
          let data: any;
          for (const [key, value] of Object.entries(result)) {
            for (let i = 0; i < value.length; i += 1) {
              const filePath = key;
              data = value[i];
              if (data.id !== 'none') {
                const resultId = await self.insertResultBulkReScan(this.connection, data, files[filePath]);
                if (resultId > 0) resultLicense[resultId] = data.licenses;
              }
            }
          }
          this.connection.run('commit', () => {
            if (Object.keys(result).length > 0) resolve(resultLicense);
            resolve(null);
          });
        });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  public async insertFromFile(resultPath: string, files: any): Promise<IInsertResult> {
    const resultLicense: any = {};
    const result: Record<any, any> = await utilModel.readFile(resultPath);
    let data: any;
    for (const [key, value] of Object.entries(result)) {
      for (let i = 0; i < value.length; i += 1) {
        const filePath = key;
        data = value[i];
        if (data.id !== 'none') {
          const resultId = await this.insertResultBulk(this.connection, data, files[filePath]);
          resultLicense[resultId] = data.licenses;
        }
      }
    }
    return resultLicense;
  }

  public async insertResultLicense(data: IInsertResult):Promise<void> {
    const promises = [];
    const call:any = util.promisify(this.connection.run.bind(this.connection));
    for (const [resultId, value] of Object.entries<Array<IResultLicense>>(data)) {
      for (let i = 0; i < value.length; i += 1) {
        promises.push(call(
          'INSERT OR IGNORE INTO result_license (spdxid,source,resultId,patent_hints,copyLeft,osadl_updated,incompatible_with,checklist_url) VALUES (?,?,?,?,?,?,?,?);',
          value[i].name,
          value[i].source,
          resultId,
          value[i].patent_hints ? value[i].patent_hints : null,
          value[i].copyleft ? value[i].copyleft : null,
          value[i].osadl_updated ? value[i].osadl_updated : null,
          value[i].incompatible_with ? value[i].incompatible_with : null,
          value[i].checklist_url ? value[i].checklist_url : null,
        ));
      }
    }
    await Promise.all(promises);
  }

  public async count(): Promise<number> {
    const call:any = util.promisify(this.connection.get.bind(this.connection));
    const result = await call('SELECT COUNT(*)as count FROM results;');
    return result.count;
  }

  public async updateDirty(value: number):Promise<void> {
    const call = util.promisify(this.connection.run.bind(this.connection));
    await call(`UPDATE results SET dirty=${value} WHERE id IN (SELECT id FROM results);`);
  }

  public async deleteDirty(): Promise<void> {
    const call = util.promisify(this.connection.run.bind(this.connection));
    await call('DELETE FROM results WHERE dirty=1;');
  }

  private insertResultBulk(db: any, data: any, fileId: number): Promise<number> {
    return new Promise<number>((resolve) => {
      db.run(
        queries.SQL_INSERT_RESULTS,
        data.file_hash,
        data.vendor,
        data.component,
        data.version,
        data.latest,
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
        'engine',
        function (this: any, error: any) {
          resolve(this.lastID);
        },
      );
    });
  }

  private async insertResultBulkReScan(db: any, data: any, fileId: number): Promise<number> {
    return new Promise<number>((resolve) => {
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
        db.get(SQLquery, (err: any, result: any) => {
          if (result !== undefined) {
            db.run('UPDATE results SET dirty=0 WHERE id=?', result.id);
            resolve(-1);
          }
          const id = self.insertResultBulk(db, data, fileId);
          resolve(id);
        });
      });
    });
  }

  public async getFromPath(path: string) {
    const call = util.promisify(this.connection.all.bind(this.connection)) as any;
    const results = await call(queries.SQL_SCAN_SELECT_FILE_RESULTS, path);
    if (results) return results;
    return [];
  }

  public async getSummaryByids(ids: number[]) {
    const sql = queries.SQL_GET_SUMMARY_BY_RESULT_ID.replace('#values', `(${ids.toString()})`);
    const call = util.promisify(this.connection.all.bind(this.connection));
    const summary = await call(sql);
    return summary;
  }

  public async getResultsPreLoadInventory(queryBuilder: QueryBuilder) {
    const SQLquery = this.getSQL(queryBuilder, queries.SQL_GET_RESULTS_PRELOADINVENTORY, this.getEntityMapper());
    const call = util.promisify(this.connection.all.bind(this.connection)) as any;
    const results = await call(SQLquery.SQL, ...SQLquery.params);
    return results;
  }

  public async getAll(queryBuilder: QueryBuilder) {
    const SQLquery = this.getSQL(queryBuilder, queries.SQL_GET_ALL_RESULTS, this.getEntityMapper());
    const call = util.promisify(this.connection.all.bind(this.connection)) as any;
    const results = await call(SQLquery.SQL, ...SQLquery.params);
    return results;
  }

  public async getDetectedReport() {
    const call = util.promisify(this.connection.all.bind(this.connection));
    const response = await call(`SELECT cv.purl,cv.version,cv.name, r.vendor, rl.spdxid,rl.patent_hints,rl.copyLeft,rl.incompatible_with FROM component_versions cv
                                INNER JOIN results r ON cv.purl = r.purl AND cv.version = r.version
                                LEFT JOIN result_license rl ON rl.resultId = r.id;`);
    return response;
  }

  public async getIdentifiedReport() {
    const call = util.promisify(this.connection.all.bind(this.connection));
    const response = await call(`SELECT cv.purl,cv.version,cv.name, r.vendor, rl.spdxid,rl.patent_hints,rl.copyLeft,rl.incompatible_with FROM component_versions cv
                                INNER JOIN results r ON cv.purl = r.purl AND cv.version = r.version
                                INNER JOIN result_license rl ON rl.resultId = r.id;`);
    return response;
  }

  public async getFileMatch(queryBuilder: QueryBuilder) {
    const SQLquery = this.getSQL(queryBuilder, 'SELECT * from files f LEFT JOIN results r ON f.fileId = r.fileId #FILTER', {
      filePath: 'f.path',
      purl: 'r.purl',
      version: 'r.version',
      url: 'r.url',
    });
    const call:any = util.promisify(this.connection.get.bind(this.connection));
    const response = await call(SQLquery.SQL, ...SQLquery.params);
    return response;
  }

  public getEntityMapper(): Record<string, string> {
    return ResultModel.entityMapper;
  }
}
