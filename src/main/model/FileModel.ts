import log from 'electron-log';
import { FileDTO } from '@api/dto';
import * as util from 'util';
import { Querys } from './querys_db';
import { InventoryModel } from './InventoryModel';
import { Model } from './Model';
import { QueryBuilder } from './queryBuilder/QueryBuilder';
const { promisify } = require('util');

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
    const SQLquery = this.getSQL(queryBuilder,
                `SELECT f.fileId, f.path,(CASE WHEN f.identified=1 THEN 'IDENTIFIED' WHEN f.identified=0 AND f.ignored=0 THEN 'PENDING' ELSE 'ORIGINAL' END) AS status, f.type FROM files f #FILTER;`,
                this.getEntityMapper()
              );
    const db = await this.openDb();
    const call = promisify(db.get.bind(db));
    const file = await call(SQLquery.SQL,...SQLquery.params);
    db.close();
    return file;
  }

  public async getAll(queryBuilder?: QueryBuilder): Promise<any[]> {
    const SQLquery = this.getSQL(queryBuilder, query.SQL_GET_ALL_FILES, this.getEntityMapper());
    const db = await this.openDb();
    const call = promisify(db.all.bind(db));
    const files = await call(SQLquery.SQL,...SQLquery.params);
    db.close();
    return files;
  }

  public async getAllBySearch(queryBuilder?: QueryBuilder): Promise<any[]> {
    const db = await this.openDb();
    const SQLQuery = this.getSQL(queryBuilder, query.SQL_GET_ALL_FILES_BY_SEARCH, this.getEntityMapper());
    const call = util.promisify(db.all.bind(db));
    const files = await call(SQLQuery.SQL, ...SQLQuery.params);
    db.close();
    return files;
  }

  public async ignored(files: number[]) {
    const sql = `${query.SQL_UPDATE_IGNORED_FILES}(${files.toString()});`;
    const db = await this.openDb();
    const call = promisify(db.run.bind(db));
    await call(sql);
    db.close();
  }

  public async insertFiles(data: Array<any>) {
    const db = await this.openDb();
    const call = promisify(db.run.bind(db));
    const promises = [];
    for(let i=0; i< data.length ; i+=1) {
      promises.push(call('INSERT INTO FILES(path,type) VALUES(?,?)', data[i].path, data[i].type));
    }
    await Promise.all(promises);
    db.close();
  }

  public async setDirty(dirty: number, path?: string) {
  const db = await this.openDb();
  const call = promisify(db.run.bind(db));
  const SQLquery = path !== undefined ? `UPDATE files SET dirty=${dirty} WHERE path IN (${path});` : `UPDATE files SET dirty=${dirty};`;
  await call(SQLquery);
  db.close();
  }

  public async getDirty() {
    const db = await this.openDb();
    const call = promisify(db.all.bind(db));
    const dirtyFiles = await call(`SELECT fileId AS id FROM files WHERE dirty=1;`);
    db.close();
    if (dirtyFiles) return dirtyFiles.map((item: any) => item.id);
    return [];
  }
  public async deleteDirty() {
    const db = await this.openDb();
    const call = promisify(db.run.bind(db));
    await call(`DELETE FROM files WHERE dirty=1;`);
    db.close();
  }
  public async getClean() {
    const db = await this.openDb();
    const call = promisify(db.all.bind(db));
    const files = await call('SELECT * FROM files WHERE dirty=0;');
    db.close();
    return files;
  }
  public async getFilesRescan() {
    const db = await this.openDb();
    const call = promisify(db.all.bind(db));
    const files = await call('SELECT f.path,f.identified ,f.ignored ,f.type AS original,(CASE WHEN  f.identified=0 AND f.ignored=0 THEN 1 ELSE 0 END) as pending FROM files f;');
    db.close();
    return files;
  }

  public async restore(files: number[]) {
    const db = await this.openDb();
    const filesIds = `(${files.toString()});`;
    const sql = query.SQL_FILE_RESTORE + filesIds;
    const call = promisify(db.run.bind(db));
    await call(sql);
    db.close();
  }

  public async identified(ids: number[]) {
    const db = await this.openDb();
    const call = promisify(db.run.bind(db));
    const resultsid = `(${ids.toString()});`;
    const sql = query.SQL_FILES_UPDATE_IDENTIFIED + resultsid;
    await call(sql);
    db.close();
  }
  public async updateFileType(fileIds: number[], fileType: string) {
    const db = await this.openDb();
    const call = promisify(db.run.bind(db));
    const sql = `UPDATE files SET type=? WHERE fileId IN (${fileIds.toString()});`;
    await call(sql,fileType);
    db.close()
  }

  public async getSummary() {
    const db = await this.openDb();
    const call = promisify(db.get.bind(db));
    const summary = await call(`SELECT COUNT(*) as totalFiles , (SELECT COUNT(*) FROM files WHERE type='MATCH') AS matchFiles,
                (SELECT COUNT(*) FROM files WHERE type='FILTERED') AS filterFiles,
                (SELECT COUNT(*) FROM files WHERE type='NO-MATCH') AS  noMatchFiles, (SELECT COUNT(*) FROM files f WHERE f.type="MATCH" AND f.identified=1) AS scannedIdentified,
                (SELECT COUNT(*) AS detectedIdentifiedFiles FROM files f WHERE f.identified=1) AS totalIdentified,
                (SELECT COUNT(*) AS detectedIdentifiedFiles FROM files f WHERE f.ignored=1) AS original,
                (SELECT COUNT(*) AS pending FROM files f WHERE f.identified=0 AND f.ignored=0 AND f.type="MATCH") AS pending  FROM files;`);
    db.close();
    return summary;
  }

  public getEntityMapper(): Record<string, string> {
    return FileModel.entityMapper;
  }
}
