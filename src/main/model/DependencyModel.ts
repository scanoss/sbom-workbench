import log from 'electron-log';
import { QueryBuilder } from './queryBuilder/QueryBuilder';
import { Model } from './Model';
import { Querys } from './querys_db';
import { Dependency } from '../../api/types';
import { Dependency as Dep } from './entity/Dependency';
import { NodeStatus } from '../workspace/tree/Node';
import util from 'util';

const query = new Querys();

export class DependencyModel extends Model {
  public static readonly entityMapper = {
    path: 'f.path',
    purl: 'd.purl',
    version: 'd.version',
    id: 'd.dependencyId',
  };

  public constructor(path: string) {
    super(path);
  }

  public async insertAll(dependencies: Array<Dep>) {
    const db = await this.openDb();
    const call = util.promisify(db.run.bind(db));
    const promises = [];
    dependencies.forEach((d) => {
      promises.push(call(
        query.SQL_DEPENDENCIES_INSERT,
        d.fileId,
        d.purl ? decodeURIComponent(d.purl) : null,
        d.version ? d.version : null,
        d.scope ? d.scope : null,
        d.licenses.length > 0 ? d.licenses.join(',') : null,
        d.component,
        d.version ? d.version : null,
        d.originalLicense.length > 0 ? d.originalLicense.join(',') : null));
    });
    await Promise.all(promises);
    db.close();
  }
  public async getAll(queryBuilder: QueryBuilder): Promise<Array<Dependency>> {
    const SQLquery = this.getSQL(queryBuilder, query.SQL_GET_ALL_DEPENDENCIES, DependencyModel.entityMapper);
    const db = await this.openDb();
    const call = util.promisify(db.all.bind(db));
    const dependencies = await call(SQLquery.SQL, ...SQLquery.params);
    db.close();
    dependencies.forEach((d) => {
      if (d.licenses) d.licenses = d.licenses.split(/;|\//g);
      else d.licenses = [];
      if (d.originalLicense)
        d.originalLicense = d.originalLicense.split(/;|\//g);
    });
    return dependencies;
  }

  public async update(dependency: Array<any>):Promise<void> {
    const db = await this.openDb();
    const call = util.promisify(db.run.bind(db));
    await call(`UPDATE dependencies SET rejectedAt=?,scope=?,purl=?,version=?,licenses=? WHERE dependencyId=?;`,
      ...dependency);
    db.close();
  }
  public async deleteDirty(data: Record<string, string>): Promise<void> {
    const SQLquery = query.SQL_DELETE_DIRTY_DEPENDENCIES.replace(
      '#PURLS',
      data.purls
    )
      .replace('#VERSIONS', data.versions)
      .replace('#LICENSES', data.licenses);
    const db = await this.openDb();
    const call = util.promisify(db.run.bind(db));
    await call(SQLquery);
    db.close();
  }
  public async getDependenciesFiles(): Promise<Array<Record<string, string>>> {
    const db = await this.openDb();
    const call = util.promisify(db.all.bind(db));
    const dependencyFiles = await call('SELECT DISTINCT f.path FROM files f INNER JOIN dependencies d ON d.fileId=f.fileId;');
    db.close();
    return dependencyFiles;
  }
  public async getStatus() {
    const db = await this.openDb();
    const call = util.promisify(db.all.bind(db));
    const dependencyStatus = await call(query.SQL_DEPENDENCY_STATUS);
    db.close();
    return dependencyStatus;
  }
  public getEntityMapper(): Record<string, string> {
    return DependencyModel.entityMapper;
  }
}
