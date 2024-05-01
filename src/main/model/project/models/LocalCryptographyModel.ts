import sqlite3 from 'sqlite3';
import { Model } from '../../Model';

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
}
