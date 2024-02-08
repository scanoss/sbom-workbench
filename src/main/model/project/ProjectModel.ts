import { ComponentModel } from './models/ComponentModel';
import { FileModel } from './models/FileModel';
import { InventoryModel } from './models/InventoryModel';
import { LicenseModel } from './models/LicenseModel';
import { ResultModel } from './models/ResultModel';
import { DependencyModel } from './models/DependencyModel';
import { VulnerabilityModel } from './models/VulnerabilityModel';
import { CryptographyModel } from './models/CryptographyModel';
import util from 'util';
import { queries } from '../querys_db';
import sqlite3 from 'sqlite3';
import { QueryBuilder } from '../queryBuilder/QueryBuilder';
import { Connection } from '../Connection';

export class ProjectModel {

  private connection: sqlite3.Database;

  private readonly path: string;

  public static readonly entityMapper = {};

  component: ComponentModel;

  file: FileModel;

  inventory: InventoryModel;

  license: LicenseModel;

  result: ResultModel;

  lastID: any;

  dependency: DependencyModel;

  vulnerability: VulnerabilityModel;

  cryptography: CryptographyModel;

  constructor(path: string) {
    this.path = `${path}/scan_db`;
    this.file = null;
    this.inventory = null;
    this.result = null;
    this.license = null;
    this.component = null;
    this.dependency = null;
    this.vulnerability = null;
    this.cryptography = null;
  }


  private async createViews(): Promise<void> {
    const call = util.promisify(this.connection.run.bind(this.connection));
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
  }

  private async createProjectDb() {
    const call = util.promisify(this.connection.exec.bind(this.connection));
    await call(queries.SQL_DB_TABLES);
    await this.createViews();
  }

  private initProjectModels() {
    this.file = new FileModel(this.connection);
    this.inventory = new InventoryModel(this.connection);
    this.result = new ResultModel(this.connection);
    this.license = new LicenseModel(this.connection);
    this.component = new ComponentModel(this.connection);
    this.dependency = new DependencyModel(this.connection);
    this.vulnerability = new VulnerabilityModel(this.connection);
    this.cryptography = new CryptographyModel(this.connection);
  }


  public async init(): Promise<void>{
    try {
      const conn = new Connection(this.path);
      this.connection = await conn.createDB();
      await this.createProjectDb();
      this.initProjectModels();
    } catch (error: any) {
      console.log(error);
      return error;
    }
  }

  public getEntityMapper():Record<string,string>{
    return ProjectModel.entityMapper;
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

  public destroy(){
    this.connection.close();
    this.connection = null;
  }


}
