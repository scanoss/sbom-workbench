import log from 'electron-log';
import { DependencyDTO } from '../../api/types';
import { QueryBuilder } from '../queryBuilder/QueryBuilder';
import { Model } from './Model';
import { Querys } from './querys_db';

const query = new Querys();

export class DependencyModel extends Model {
  public static readonly entityMapper = { path: 'f.path', purl: 'd.purl', version: 'd.version' };

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
                dependency.purl,
                dependency.version,
                dependency.scope ? dependency.scope : null,
                dependency.licensesList.join(','),
                dependency.component
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

  public async getAll(queryBuilder: QueryBuilder) {
    return new Promise<Array<DependencyDTO>>(async (resolve, reject) => {
      try {
        const SQLquery = this.getSQL(queryBuilder, query.SQL_GET_ALL_DEPENDENCIES, DependencyModel.entityMapper);
        const db = await this.openDb();
        db.all(SQLquery.SQL, ...SQLquery.params, async (err: any, dep: any) => {
          db.close();
          if (err) throw err;
          dep.forEach((d) => {
            d.licenses = d.licenses.split(',');
          });
          resolve(dep);
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  public getEntityMapper(): Record<string, string> {
    return DependencyModel.entityMapper;
  }
}