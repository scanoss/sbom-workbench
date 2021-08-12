
import { Db } from './db';
import { Querys } from './querys_db';

export class InventoryFilesDb extends Db {
    query: any;
    constructor(path:string){
        super(path); 
        this.query= new Querys;
    }

    unignored(files: number[]) {
        return new Promise(async (resolve, reject) => {
          try {
            const db = await this.openDb();
            db.serialize( () => {
              db.run('begin transaction');
              for (let i = 0; i < files.length; i += 1) {
                db.run(this.query.SQL_UPDATE_UNIGNORED_FILES, files[i]);
              }
              db.run('commit', () => {
                db.close();
                resolve(true);
              });
            });
          } catch (error) {
            reject(new Error('Unignore files were not successfully retrieved'));
          }
        });
      }

}