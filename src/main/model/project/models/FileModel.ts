import * as util from 'util';
import { queries } from '../../querys_db';
import { InventoryModel } from './InventoryModel';
import { QueryBuilder } from '../../queryBuilder/QueryBuilder';
import sqlite3 from 'sqlite3';
import { Model } from '../../Model';
const { promisify } = require('util');


export class FileModel  extends Model {

  private connection: sqlite3.Database;

  public static readonly entityMapper = {
    path: 'f.path',
    purl: 'comp.purl',
    version: 'comp.version',
    source: 'comp.source',
    id: 'fileId',
  };

  inventory: InventoryModel;

  constructor(conn: sqlite3.Database) {
    super();
    this.connection = conn;
    this.inventory = new InventoryModel(conn);
  }

  public async get(queryBuilder: QueryBuilder) {
    const SQLquery = this.getSQL(queryBuilder,
                `SELECT f.fileId, f.path,(CASE WHEN f.identified=1 THEN 'IDENTIFIED' WHEN f.identified=0 AND f.ignored=0 THEN 'PENDING' ELSE 'ORIGINAL' END) AS status, f.type FROM files f #FILTER;`,
                this.getEntityMapper()
              );
    const call = promisify(this.connection.get.bind(this.connection));
    const file = await call(SQLquery.SQL,...SQLquery.params);
    return file;
  }

  public async getAll(queryBuilder?: QueryBuilder): Promise<any[]> {
    const SQLquery = this.getSQL(queryBuilder, queries.SQL_GET_ALL_FILES, this.getEntityMapper());
    const call = promisify(this.connection.all.bind(this.connection));
    const files = await call(SQLquery.SQL, SQLquery.params);
    return files;
  }

  public async getAllBySearch(queryBuilder?: QueryBuilder): Promise<any[]> {
    const SQLQuery = this.getSQL(queryBuilder, queries.SQL_GET_ALL_FILES_BY_SEARCH, this.getEntityMapper());
    const call:any = util.promisify(this.connection.all.bind(this.connection));
    const files = await call(SQLQuery.SQL, ...SQLQuery.params);
    return files;
  }

  public async ignored(files: number[]) {
    const sql = `${queries.SQL_UPDATE_IGNORED_FILES}(${files.toString()});`;
    const call = promisify(this.connection.run.bind(this.connection));
    await call(sql);
  }

  public async insertFiles(data: Array<any>) {
    const call = promisify(this.connection.run.bind(this.connection));
    const promises = [];
    for(let i=0; i< data.length ; i+=1) {
      promises.push(call('INSERT INTO FILES(path,type) VALUES(?,?)', data[i].path, data[i].type));
    }
    await Promise.all(promises);
  }

  public async setDirty(dirty: number, path?: string) {
  const call = promisify(this.connection.run.bind(this.connection));
  const SQLquery = path !== undefined ? `UPDATE files SET dirty=${dirty} WHERE path IN (${path});` : `UPDATE files SET dirty=${dirty};`;
  await call(SQLquery);
  }

  public async getDirty() {
    const call = promisify(this.connection.all.bind(this.connection));
    const dirtyFiles = await call(`SELECT fileId AS id FROM files WHERE dirty=1;`);
    if (dirtyFiles) return dirtyFiles.map((item: any) => item.id);
    return [];
  }
  public async deleteDirty() {
    const call = promisify(this.connection.run.bind(this.connection));
    await call(`DELETE FROM files WHERE dirty=1;`);
  }
  public async getClean() {
    const call = promisify(this.connection.all.bind(this.connection));
    const files = await call('SELECT * FROM files WHERE dirty=0;');
    return files;
  }
  public async getFilesRescan() {
    const call = promisify(this.connection.all.bind(this.connection));
    const files = await call('SELECT f.path,f.identified ,f.ignored ,f.type AS original,(CASE WHEN  f.identified=0 AND f.ignored=0 THEN 1 ELSE 0 END) as pending FROM files f;');
    return files;
  }

  public async restore(files: number[]) {
    const filesIds = `(${files.toString()});`;
    const sql = queries.SQL_FILE_RESTORE + filesIds;
    const call = promisify(this.connection.run.bind(this.connection));
    await call(sql);
  }

  public async identified(ids: number[]) {
    const call = promisify(this.connection.run.bind(this.connection));
    const resultsid = `(${ids.toString()});`;
    const sql = queries.SQL_FILES_UPDATE_IDENTIFIED + resultsid;
    await call(sql);
  }
  public async updateFileType(fileIds: number[], fileType: string) {
    const call = promisify(this.connection.run.bind(this.connection));
    const sql = `UPDATE files SET type=? WHERE fileId IN (${fileIds.toString()});`;
    await call(sql,fileType);
  }

  public async getSummary() {
    const call = promisify(this.connection.get.bind(this.connection));
    const summary = await call(`SELECT COUNT(*) as totalFiles , (SELECT COUNT(*) FROM files WHERE type='MATCH') AS matchFiles,
                (SELECT COUNT(*) FROM files WHERE type='FILTERED') AS filterFiles,
                (SELECT COUNT(*) FROM files WHERE type='NO-MATCH') AS  noMatchFiles, (SELECT COUNT(*) FROM files f WHERE f.type="MATCH" AND f.identified=1) AS scannedIdentified,
                (SELECT COUNT(*) AS detectedIdentifiedFiles FROM files f WHERE f.identified=1) AS totalIdentified,
                (SELECT COUNT(*) AS detectedIdentifiedFiles FROM files f WHERE f.ignored=1) AS original,
                (SELECT COUNT(*) AS pending FROM files f WHERE f.identified=0 AND f.ignored=0 AND f.type="MATCH") AS pending  FROM files;`);
    return summary;
  }

  public async getDetectedSummary() {
    const call = promisify(this.connection.get.bind(this.connection));
    const summary = await call(`SELECT COUNT(*) as totalFiles , (SELECT COUNT(*) FROM files WHERE type='MATCH') AS matchFiles,
                (SELECT COUNT(*) FROM files WHERE type='FILTERED') AS filterFiles,
                (SELECT COUNT(*) FROM files WHERE type='NO-MATCH') AS  noMatchFiles,
                0 AS scannedIdentified,
                0 AS totalIdentified,
                0 AS original,
                (SELECT COUNT(*) AS pending FROM files f WHERE f.identified=0 AND f.ignored=0 AND f.type="MATCH") AS pending  FROM files;`);
    return summary;
  }

  public getEntityMapper(): Record<string, string> {
    return FileModel.entityMapper;
  }
}
