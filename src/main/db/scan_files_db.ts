/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-syntax */
import { Dvr } from '@material-ui/icons';
import { Querys } from './querys_db';
import { Db } from './db';
import { UtilsDb } from './utils_db';

const query = new Querys();
const utilsDb = new UtilsDb();

export class FilesDb extends Db {
  constructor() {
    super();
  }

  private insertFile(stmt: any, data: any, filePath: string) {
    stmt.run(data.file_hash, 0, 'n/a', filePath);
  }

  insert(resultPath: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const result: object = await utilsDb.readFile(resultPath);
        const db: any = await this.openDb();
        const stmt = db.prepare(query.SQL_INSERT_FILES);
        let data: any;
        let filePath: string;
        for (const [key, value] of Object.entries(result)) {
          for (let i = 0; i < value.length; i = +1) {
            filePath = key;
            data = value[i];
            this.insertFile(stmt, data, filePath);
          }
        }
        stmt.finalize();
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  get(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(
          query.SQL_SELECT_FILES_FROM_PURL_VERSION,
          data.purl,
          data.version,
          function (err: any, file: any) {
            db.close();
            if (!err) resolve(file);
            else resolve([]);
          }
        );
      } catch (error) {
        reject(new Error('error'));
      }
    });
  }
}
