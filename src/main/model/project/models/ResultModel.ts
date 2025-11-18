import * as util from 'util';
import sqlite3 from 'sqlite3';
import { queries } from '../../querys_db';
import { utilModel } from '../../UtilModel';
import { ComponentModel } from './ComponentModel';
import { licenseHelper } from '../../../helpers/LicenseHelper';
import { QueryBuilder } from '../../queryBuilder/QueryBuilder';
import { IInsertResult, IResultLicense } from '../../interfaces/IInsertResult';
import { Model } from '../../Model';
import fs from 'fs';
import { parser } from 'stream-json';
import { streamObject } from 'stream-json/streamers/StreamObject';
import log from 'electron-log';

export class ResultModel extends Model {
  private connection: sqlite3.Database;

  public static readonly entityMapper = {
    path: 'f.path',
    source: 'comp.source',
    purl: 'r.purl',
    version: 'r.version',
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
        // Check if result file exists and has content before parsing
        if (!fs.existsSync(resultPath)) {
          log.info('[ ResultModel ]: Result file does not exist, skipping rescan import');
          resolve(null);
          return;
        }
        const stats = fs.statSync(resultPath);
        if (stats.size === 0) {
          log.info('[ ResultModel ]: Result file is empty, skipping rescan import');
          resolve(null);
          return;
        }

        const self = this;
        const resultLicense: any = {};
        const result: Record<any, any> = await utilModel.readFile(resultPath);
        this.connection.serialize(async () => {
          this.connection.run('begin transaction');

          const pipeline = fs.createReadStream(resultPath)
            .pipe(parser())
            .pipe(streamObject());

          pipeline.on('data', async ({ key, value }) => {
            for (let i = 0; i < value.length; i += 1) {
              if (value[i].id !== 'none') {
                const resultId = await self.insertResultBulkReScan(this.connection, value[i], files[key]);
                if (resultId > 0) resultLicense[resultId] = value[i].licenses;
              }
            }
          });

          pipeline.on('end', () => {
            this.connection.run('commit', () => {
              if (Object.keys(result).length > 0) resolve(resultLicense);
              resolve(null);
            });
          });

          pipeline.on('error', () => {
            this.connection.run('commit', (err ) => {
              reject(err);
            });
          });
        });
      } catch (error: any) {
        log.error(error);
        reject(error);
      }
    });
  }

  public async insertFromFile(resultPath: string, files: any): Promise<IInsertResult> {
    return new Promise<IInsertResult>(async (resolve, reject) => {
      // Check if result file exists and has content before parsing
      if (!fs.existsSync(resultPath)) {
        log.info('[ ResultModel ]: Result file does not exist, skipping import');
        resolve({});
        return;
      }
      const stats = fs.statSync(resultPath);
      if (stats.size === 0) {
        log.info('[ ResultModel ]: Result file is empty, skipping import');
        resolve({});
        return;
      }

      const run = util.promisify(this.connection.run.bind(this.connection)) as any;

      this.connection.serialize(async () => {
        await run('begin transaction');
        const pipeline = fs.createReadStream(resultPath).pipe(parser()).pipe(streamObject());
        const pendingOperations: Promise<void>[] = [];

        const insertLicense = async (resultId: number, license: IResultLicense) => {
          await run(
            'INSERT OR IGNORE INTO result_license (spdxid,source,resultId,patent_hints,copyLeft,osadl_updated,incompatible_with,checklist_url) VALUES (?,?,?,?,?,?,?,?);',
            license.name,
            license.source,
            resultId,
            license.patent_hints || null,
            license.copyleft || null,
            license.osadl_updated || null,
            license.incompatible_with || null,
            license.checklist_url || null,
          );
        };

        pipeline.on('data', ({ key, value }) => {
          pipeline.pause();

          const processData = async () => {
            for (let i = 0; i < value.length; i += 1) {
              if (value[i].id !== 'none' && value[i].id !== 'dependency') {
                const resultId = await this.insertResultBulk(this.connection, value[i], files[key]);

                if (value[i].licenses && value[i].licenses.length > 0) {
                  for (const license of value[i].licenses) {
                    await insertLicense(resultId, license);
                  }
                }
              }
            }
            pipeline.resume();
          };

          pendingOperations.push(processData());
        });

        pipeline.on('end', async () => {
          try {
            await Promise.all(pendingOperations);
            await run('commit');
            resolve({});
          } catch (err) {
            await run('rollback');
            reject(err);
          }
        });

        pipeline.on('error', async (error) => {
          try {
            await run('rollback');
          } catch (rollbackErr) {
            reject(rollbackErr);
            return;
          }
          reject(error);
        });
       });

    });
  }

  public async insertResultLicense(data: IInsertResult):Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      this.connection.serialize(async () => {
        this.connection.run('begin transaction');
        for (const [resultId, value] of Object.entries<Array<IResultLicense>>(data)) {
          for (let i = 0; i < value.length; i += 1) {
            this.connection.run(
              'INSERT OR IGNORE INTO result_license (spdxid,source,resultId,patent_hints,copyLeft,osadl_updated,incompatible_with,checklist_url) VALUES (?,?,?,?,?,?,?,?);',
              value[i].name,
              value[i].source,
              resultId,
              value[i].patent_hints ? value[i].patent_hints : null,
              value[i].copyleft ? value[i].copyleft : null,
              value[i].osadl_updated ? value[i].osadl_updated : null,
              value[i].incompatible_with ? value[i].incompatible_with : null,
              value[i].checklist_url ? value[i].checklist_url : null,
            );
          }
        }

        this.connection.run('commit', (err: any) => {
          if (!err) resolve();
          reject(err);
        });
      });
    });
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
        data.download_url ? data.download_url : null,
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
      } AND url_hash ${data.url_hash ? `='${data.url_hash}'` : 'IS NULL'} AND purl = '${
        data.purl ? data.purl[0] : ' '
      }' AND fileId = ${fileId}  AND file_url ${data.file_url ? `='${data.file_url}'` : 'IS NULL'}
      AND idtype='${data.id}'
      AND download_url=${data.download_url ? `='${data.download_url}'` : 'IS NULL'}; `;
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
    const response = await call(`SELECT DISTINCT cv.purl,cv.version,cv.name, r.vendor, rl.spdxid,rl.patent_hints,rl.copyLeft,rl.incompatible_with FROM component_versions cv
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
