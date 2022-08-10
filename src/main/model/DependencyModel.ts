import log from 'electron-log';
import { QueryBuilder } from './queryBuilder/QueryBuilder';
import { Model } from './Model';
import { Querys } from './querys_db';
import { Dependency } from '../../api/types';
import { Dependency as Dep } from './entity/Dependency'
import { NodeStatus } from "../workspace/tree/Node";

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
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          db.run('begin transaction');
          dependencies.forEach((d) => {
              db.run(
                query.SQL_DEPENDENCIES_INSERT,
                d.fileId,
                d.purl ? decodeURIComponent(d.purl) : null,
                d.version ? d.version : null,
                d.scope ? d.scope : null,
                d.licenses.length > 0  ? d.licenses.join(',') : null,
                d.component,
                d.version ? d.version : null,
                d.originalLicense.length > 0 ? d.originalLicense.join(',') :null
              );
            });
          db.run('commit', (err: any) => {
            db.close();
            if (err) throw err;
            resolve(true);
          });
        });
    }
    catch (err) {
        reject(err);
      }
    });
  }

  public async getAll(queryBuilder: QueryBuilder): Promise<Array<Dependency>> {
    return new Promise<Array<Dependency>>(async (resolve, reject) => {
      try {
        const SQLquery = this.getSQL(
          queryBuilder,
          query.SQL_GET_ALL_DEPENDENCIES,
          DependencyModel.entityMapper
        );
        const db = await this.openDb();
        db.all(SQLquery.SQL, ...SQLquery.params, async (err: any, dep: any) => {
          db.close();
          if (err) throw err;
          dep.forEach((d) => {
            if (d.licenses) d.licenses = d.licenses.split(',');
            else d.licenses = [];
            if (d.originalLicense)
              d.originalLicense = d.originalLicense.split(',');
          });
          resolve(dep);
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  public update(dependency: Array<any>) {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.run(
          `UPDATE dependencies SET rejectedAt=?,scope=?,purl=?,version=?,licenses=? WHERE dependencyId=?;`,...dependency,
          async (err: any, _dep: any) => {
            db.close();
            if (err) throw err;
            resolve(true);
          }
        );
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  public deleteDirty(data: Record<string, string>): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const SQLquery = query.SQL_DELETE_DIRTY_DEPENDENCIES.replace(
          '#PURLS',
          data.purls
        )
          .replace('#VERSIONS', data.versions)
          .replace('#LICENSES', data.licenses);
        const db = await this.openDb();
        db.run(SQLquery, async (err: any, _dep: any) => {
          db.close();
          if (err) throw err;
          resolve();
        });
      } catch (error: any) {
        log.error(error);
        reject(error);
      }
    });
  }

  public getDependenciesFiles(): Promise<Array<Record<string, string>>> {
    return new Promise<Array<Record<string, string>>>(
      async (resolve, reject) => {
        try {
          const db = await this.openDb();
          db.all(
            'SELECT DISTINCT f.path FROM files f INNER JOIN dependencies d ON d.fileId=f.fileId;',
            async (err: any, dep: Array<Record<string, string>>) => {
              db.close();
              if (err) throw err;
              resolve(dep);
            }
          );
        } catch (error: any) {
          log.error(error);
          reject(error);
        }
      }
    );
  }

  public getStatus(){
    return new Promise<Array<Record<string, NodeStatus>>>(
      async (resolve, reject) => {
        try {
          const db = await this.openDb();
          db.all(query.SQL_DEPENDENCY_STATUS, async (err: any, dep: Array<Record<string, NodeStatus>>) => {
              db.close();
              if (err) throw err;
              resolve(dep);
            }
          );
        } catch (error: any) {
          log.error(error);
          reject(error);
        }
      }
    );
  }

  public getEntityMapper(): Record<string, string> {
    return DependencyModel.entityMapper;
  }
}
