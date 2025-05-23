import util from 'util';
import { Dependency } from '@api/types';
import sqlite3 from 'sqlite3';
import { ReportComponent } from 'main/services/ReportService';
import { QueryBuilder } from '../../queryBuilder/QueryBuilder';
import { queries } from '../../querys_db';
import { Dependency as Dep } from '../../entity/Dependency';
import { Model } from '../../Model';
import { After } from '../../hooks/after/afterHook';
import { declaredComponentsAdapter } from '../../adapters/dependency/declaredComponentAdapter';

export class DependencyModel extends Model {
  private connection: sqlite3.Database;

  public static readonly entityMapper = {
    path: 'f.path',
    purl: 'd.purl',
    version: 'd.version',
    id: 'd.dependencyId',
  };

  public constructor(conn: sqlite3.Database) {
    super();
    this.connection = conn;
  }

  public async insertAll(dependencies: Array<Dep>) {
    return new Promise<void>(async (resolve, reject) => {
      this.connection.serialize(async () => {
        this.connection.run('begin transaction');

        dependencies.forEach((d) => {
          this.connection.run(
            queries.SQL_DEPENDENCIES_INSERT,
            d.fileId,
            d.purl ? d.purl : null,
            d.version ? d.version : null,
            d.scope ? d.scope : null,
            d.licenses.length > 0 ? d.licenses.join(',') : null,
            d.component,
            d.version ? d.version : null,
            d.originalLicense.length > 0 ? d.originalLicense.join(',') : null,
          );
        });
        this.connection.run('commit', (err: any) => {
          if (!err) resolve();
          reject(err);
        });
      });
    });
  }

  public async getIdentifiedDependencies() {
    const query = queries.SQL_ALL_IDENTIFIED_DEPENDENCIES;
    const call = await util.promisify(this.connection.all.bind(this.connection));
    const response = (await call(query)) as Array<{
      file: string;
      component: string;
      purl: string;
      version: string;
      licenses: string;
    }>;
    return response;
  }

  public async getDetectedDependencies() {
    const query = queries.SQL_ALL_DETECTED_DEPENDENCIES;
    const call = await util.promisify(this.connection.all.bind(this.connection));
    const response = (await call(query)) as Array<{
      file: string;
      component: string;
      purl: string;
      version: string;
      licenses: string;
    }>;
    return response;
  }

  public async getAll(queryBuilder: QueryBuilder): Promise<Array<Dependency>> {
    const SQLquery = this.getSQL(queryBuilder, queries.SQL_GET_ALL_DEPENDENCIES, DependencyModel.entityMapper);
    const call:any = util.promisify(this.connection.all.bind(this.connection));
    const dependencies = await call(SQLquery.SQL, ...SQLquery.params);
    dependencies.forEach((d) => {
      if (d.licenses) d.licenses = d.licenses.split(',');
      else d.licenses = [];
      if (d.originalLicense) d.originalLicense = d.originalLicense.split(',');
    });
    return dependencies;
  }

  public async update(dependency: Array<any>): Promise<void> {
    const call:any = util.promisify(this.connection.run.bind(this.connection));
    await call(
      'UPDATE dependencies SET rejectedAt=?,scope=?,purl=?,version=?,licenses=? WHERE dependencyId=?;',
      ...dependency,
    );
  }

  public async updateBulk(dependencies: Array<Partial<Dependency>>): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      this.connection.serialize(async () => {
        this.connection.run('begin transaction');

        dependencies.forEach((d) => {
          this.connection.run(
            'UPDATE dependencies SET rejectedAt=?,scope=?,purl=?,version=?,licenses=? WHERE dependencyId=?;',
            d.rejectedAt,
            d.scope ? d.scope : null,
            d.purl,
            d.version ? d.version : null,
            d.originalLicense ? d.originalLicense.join(',').toString() : null,
            d.dependencyId,
          );
        });

        this.connection.run('commit', (err: any) => {
          if (!err) resolve();
          reject(err);
        });
      });
    });
  }

  public async deleteAll(): Promise<void> {
    const SQLquery = queries.SQL_DELETE_ALL_DEPENDENCIES;
    const call = util.promisify(this.connection.run.bind(this.connection));
    await call(SQLquery);
  }

  public async getDependenciesFiles(): Promise<Array<Record<string, string>>> {
    const call:any = util.promisify(this.connection.all.bind(this.connection));
    const dependencyFiles = await call(
      'SELECT DISTINCT f.path FROM files f INNER JOIN dependencies d ON d.fileId=f.fileId;',
    );
    return dependencyFiles;
  }

  public async getStatus() {
    const call = util.promisify(this.connection.all.bind(this.connection));
    const dependencyStatus = await call(queries.SQL_DEPENDENCY_STATUS);
    return dependencyStatus;
  }

  public getEntityMapper(): Record<string, string> {
    return DependencyModel.entityMapper;
  }

  public async getIdentifiedSummary() {
    const call = util.promisify(this.connection.all.bind(this.connection));
    const files = await call(queries.SQL_DEPENDENCY_IDENTIFIED_SUMMARY_BY_FILE_PATH);
    const callTotal:any = util.promisify(this.connection.get.bind(this.connection));
    const totalIdentified = await callTotal(queries.SQL_DEPENDENCY_TOTAL_IDENTIFIED);
    return { files, total: totalIdentified.total };
  }

  public async getDetectedSummary() {
    const call = util.promisify(this.connection.all.bind(this.connection));
    const files = await call(queries.SQL_DEPENDENCY_DETECTED_SUMMARY_BY_FILE_PATH);
    const callTotal = util.promisify(this.connection.get.bind(this.connection)) as any;
    const totalDetected = await callTotal(queries.SQL_DEPENDENCY_TOTAL_DETECTED);
    return { files, total: totalDetected.total };
  }

  public async getById(ids: Array<Number>) {
    const dependenciesIds = ids.map((id) => `'${id}'`).join(',');
    const call:any = util.promisify(this.connection.all.bind(this.connection));
    const query = queries.SQL_DEPENDENCIES_BY_IDS.replace('#IDS', dependenciesIds);
    const depencencies = await call(query);
    return depencencies;
  }

  public async getSummary(path: string): Promise<Array<any>> {
    const call:any = util.promisify(this.connection.all.bind(this.connection));
    const depencencies = await call(queries.SQL_DEPENDENCY_SUMMARY, `${path}%`);
    return depencencies;
  }

  @After(declaredComponentsAdapter)
  public async findAllDeclaredComponents(): Promise<Array<ReportComponent>> {
    return await this.getDetectedDependencies() as unknown as Array<ReportComponent>;
  }
}
