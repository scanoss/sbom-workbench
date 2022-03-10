import log from 'electron-log';
import { Model } from './Model';
import { Querys } from './querys_db';

const query = new Querys();

export class DependencyModel extends Model {
  
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
}
