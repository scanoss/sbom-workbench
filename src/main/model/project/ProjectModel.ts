import util from 'util';
import sqlite3 from 'sqlite3';
import { ComponentModel } from './models/ComponentModel';
import { FileModel } from './models/FileModel';
import { InventoryModel } from './models/InventoryModel';
import { LicenseModel } from './models/LicenseModel';
import { ResultModel } from './models/ResultModel';
import { DependencyModel } from './models/DependencyModel';
import { VulnerabilityModel } from './models/VulnerabilityModel';
import { CryptographyModel } from './models/CryptographyModel';
import { queries } from '../querys_db';
import { QueryBuilder } from '../queryBuilder/QueryBuilder';
import { Connection } from '../Connection';
import { modelProvider } from '../../services/ModelProvider';
import { LocalCryptographyModel } from './models/LocalCryptographyModel';
import { ReportModel } from './models/ReportModel';
import { ExportControlModel } from './models/ExportControlModel';

export class ProjectModel {
  private connection: Connection;

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

  localCryptography: LocalCryptographyModel;

  report : ReportModel;

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
    this.localCryptography = null;
    this.report = null;
  }

  private async createViews(db: sqlite3.Database): Promise<void> {
    const call = util.promisify(db.run.bind(db));
    await call(
      'CREATE VIEW IF NOT EXISTS components (id,name,version,purl,url,source,reliableLicense) AS SELECT DISTINCT comp.id AS compid ,comp.name,comp.version,comp.purl,comp.url,comp.source,comp.reliableLicense FROM component_versions AS comp LEFT JOIN license_component_version lcv ON comp.id=lcv.cvid;',
    );
    await call(
      'CREATE VIEW IF NOT EXISTS license_view (cvid,name,spdxid,url,license_id) AS SELECT lcv.cvid,lic.name,lic.spdxid,lic.url,lic.id FROM license_component_version AS lcv LEFT JOIN licenses AS lic ON lcv.licid=lic.id;',
    );
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

  private async createProjectDb(db: sqlite3.Database) {
    const call = util.promisify(db.exec.bind(db));
    await call(queries.SQL_DB_TABLES);
    await this.createViews(db);
  }

  private async initProjectModels(db: sqlite3.Database) {
    this.file = new FileModel(db);
    this.inventory = new InventoryModel(db);
    this.result = new ResultModel(db);
    this.license = new LicenseModel(db);
    this.component = new ComponentModel(db);
    this.dependency = new DependencyModel(db);
    this.vulnerability = new VulnerabilityModel(db);
    this.cryptography = new CryptographyModel(db);
    this.localCryptography = new LocalCryptographyModel(db);
    this.report = new ReportModel(db);
  }

  public async init(mode: number): Promise<void> {
    try {
      this.connection = new Connection(this.path);
      await this.connection.createDB();
      const db = await this.connection.openDb(mode);
      await this.createProjectDb(db);
      await this.initProjectModels(db);
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }

  public getEntityMapper(): Record<string, string> {
    return ProjectModel.entityMapper;
  }

  public getSQL(queryBuilder: QueryBuilder, SQLquery: string, entityMapper: Record<string, string>) {
    let SQL = SQLquery;
    const filter = queryBuilder?.getSQL(entityMapper) ? `WHERE ${queryBuilder.getSQL(entityMapper).toString()}` : '';
    const params = queryBuilder?.getFilters() ? queryBuilder.getFilters() : [];
    SQL = SQLquery.replace('#FILTER', filter);
    return { SQL, params };
  }

  public async destroy() {
    if (this.connection) await this.connection.close();
    this.connection = null;

    // Be sure the DB is open in R/W
    modelProvider.openModeProjectModel = sqlite3.OPEN_READWRITE;
  }
}
