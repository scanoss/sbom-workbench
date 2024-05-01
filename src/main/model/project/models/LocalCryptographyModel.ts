import util from 'util';
import sqlite3 from 'sqlite3';
import { Model } from '../../Model';
import { queries } from '../../querys_db';
import { LocalCryptography } from '../../entity/LocalCryptography';

export interface ILocalCryptographyModel {
  id: number;
  file_id: number;
  path: string;
  algorithms: string;
  type: string;
}

export class LocalCryptographyModel extends Model {
  private connection: sqlite3.Database;

  public constructor(conn: sqlite3.Database) {
    super();
    this.connection = conn;
  }

  public async import(cryptography: Array<{ fileId: number, algorithms: string }>): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      this.connection.serialize(async () => {
        this.connection.run('begin transaction');

        cryptography.forEach((c) => {
          this.connection.run(
            'INSERT OR IGNORE INTO local_cryptography (file_id,algorithms) VALUES(?,?);',
            c.fileId,
            c.algorithms,
          );
        });

        this.connection.run('commit', (err: any) => {
          if (!err) resolve();
          reject(err);
        });
      });
    });
  }

  public async findAll() : Promise<Array<LocalCryptography>> {
    const query = queries.SQL_GET_ALL_LOCAL_CRYPTOGRAPHY;
    const call = await util.promisify(this.connection.all.bind(this.connection)) as any;
    const response: Array<ILocalCryptographyModel> = await call(query);
    const crypto = this.cryptographyAdapter(response);
    return crypto;
  }

  private cryptographyAdapter(crypto: Array <ILocalCryptographyModel>): Array<LocalCryptography> {
    return crypto.map((c) => { return { file: c.path, algorithms: JSON.parse(c.algorithms) }; });
  }
}
