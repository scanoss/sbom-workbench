/* eslint-disable no-async-promise-executor */
/* eslint-disable prettier/prettier */
/* eslint-disable func-names */
import log from 'electron-log';
import sqlite3 from 'sqlite3';
import { QueryBuilder } from './queryBuilder/QueryBuilder';
import { Querys } from './querys_db';
import util from 'util';


const query = new Querys();

export class Model {
  private dbPath: string;

  public static readonly entityMapper = {};

  constructor(path: string) {
    this.dbPath = `${path}/scan_db`;
  }
  public async init() {
    try {
      const success = await this.scanCreateDb();
      if (success) return true;
    } catch (error) {
      return error;
    }
    return false;
  }

  // CREATE A NEW SCAN DB
  private scanCreateDb() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (err: any) => {
        if (err) {
          reject(new Error('Unable to create DB'));
        } else {
          db.exec(query.SQL_DB_TABLES,async () => {
            db.close();
            await this.createViews();
            resolve(true);
          });
        }
      });
    });
  }


  public openDb(): Promise<any> {
    return new Promise((resolve, reject) => {
      const db: any = new sqlite3.Database(
        this.dbPath,
        sqlite3.OPEN_READWRITE,
        (err: any) => {
          if (err) {
            log.error(err);
            reject(err);
          }
          db.run('PRAGMA journal_mode = WAL;');
          db.run('PRAGMA synchronous = OFF');
          db.run('PRAGMA foreign_keys = ON;');
          resolve(db);
        }
      );
    });
  }
  private async createViews(): Promise<void> {
    const db = await this.openDb();
    const call = util.promisify(db.run.bind(db));
    await call('CREATE VIEW IF NOT EXISTS components (id,name,version,purl,url,source,reliableLicense) AS SELECT DISTINCT comp.id AS compid ,comp.name,comp.version,comp.purl,comp.url,comp.source,comp.reliableLicense FROM component_versions AS comp LEFT JOIN license_component_version lcv ON comp.id=lcv.cvid;');
    await call('CREATE VIEW IF NOT EXISTS license_view (cvid,name,spdxid,url,license_id) AS SELECT lcv.cvid,lic.name,lic.spdxid,lic.url,lic.id FROM license_component_version AS lcv LEFT JOIN licenses AS lic ON lcv.licid=lic.id;');
    await call(`
          CREATE VIEW IF NOT EXISTS summary AS SELECT cv.id AS compid,cv.purl,cv.version,SUM(f.ignored) AS ignored, SUM(f.identified) AS identified,
          SUM(f.identified=0 AND f.ignored=0) AS pending
          FROM files f INNER JOIN Results r ON r.fileId=f.fileId
          INNER JOIN component_versions cv ON cv.purl=r.purl
          AND cv.version=r.version
          GROUP BY r.purl, r.version
          ORDER BY cv.id ASC;
          `);
    db.close();
  }
  public getEntityMapper():Record<string,string>{
    return Model.entityMapper;
  }
  public getSQL(queryBuilder:QueryBuilder , SQLquery:string, entityMapper:Record<string,string>){
    let SQL = SQLquery;
    const filter = queryBuilder?.getSQL(entityMapper)
      ? `WHERE ${queryBuilder.getSQL(entityMapper).toString()}`
      : '';
    const params = queryBuilder?.getFilters() ? queryBuilder.getFilters() : [];
    SQL = SQLquery.replace('#FILTER', filter);
    return { SQL, params };
  }
}
