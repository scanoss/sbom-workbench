import log from 'electron-log';
import { QueryBuilder } from './queryBuilder/QueryBuilder';
import { Model } from './Model';
import { Querys } from './querys_db';
import { Dependency } from '../../api/types';

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

  public async insert(files: Record<string, number>, filesDependencies: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(() => {
          db.run('begin transaction');
          filesDependencies.forEach((file) => {
            const fileId = files[file.file];
            file.dependenciesList.forEach((dependency) => {
              db.run(
                query.SQL_DEPENDENCIES_INSERT,
                fileId,
                dependency.purl ? decodeURIComponent(dependency.purl) : null,
                dependency.version ? dependency.version : null,
                dependency.scope ? dependency.scope : null,
                dependency.licensesList.length > 0 &&
                  dependency.licensesList[0] !== ''
                  ? dependency.licensesList.join(',')
                  : null,
                dependency.component,
                dependency.version ? dependency.version : null,
                dependency.licensesList.length > 0 &&
                  dependency.licensesList[0] !== ''
                  ? dependency.licensesList.join(',')
                  : null
              );
            });
          });
          db.run('commit', (err: any) => {
            db.close();
            if (err) throw err;
            resolve(true);
          });
        });
      } catch (err) {
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

  public updateLicenseAndVersion(dependency: Dependency): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.run(
          'UPDATE dependencies SET licenses=?, version=? WHERE dependencyId=?',
          dependency.licenses.join(','),
          dependency.version,
          dependency.dependencyId,
          async (err: any, dep: any) => {
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

  public update(dependency: any, rejected?: boolean) {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.run(
          `UPDATE dependencies SET rejectedAt=? WHERE purl=? AND version=?;`,
          rejected ? new Date().toISOString() : null,
          dependency.purl,
          dependency.version,
          async (err: any, dep: any) => {
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

  public restore(dependency: any) {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.run(
          `UPDATE dependencies SET rejectedAt=?, licenses=? , version=? WHERE dependencyId=?;`,
          null,
          dependency.licenses ? dependency.licenses.join(',') : null,
          dependency.version ? dependency.version : null,
          dependency.dependencyId,
          async (err: any, dep: any) => {
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

  public getEntityMapper(): Record<string, string> {
    return DependencyModel.entityMapper;
  }
}
