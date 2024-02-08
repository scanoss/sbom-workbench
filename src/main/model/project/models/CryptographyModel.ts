import util from 'util';
import { Cryptography } from '../../entity/Cryptography';
import { queries } from '../../querys_db';
import { Model } from '../../Model';
import sqlite3 from 'sqlite3';

export class CryptographyModel extends Model {
  private connection: sqlite3.Database
  public constructor(conn: sqlite3.Database) {
    super();
    this.connection = conn;
  }

  public async insertAll(cryptography: Array<{ purl: string, version: string, algorithms: string }>): Promise<void> {
    const call = util.promisify(this.connection.run.bind(this.connection)) as any;
    const promises = [];
    cryptography.forEach((c) => {
      promises.push(call(
        'INSERT OR IGNORE INTO cryptography (purl,version,algorithms) VALUES(?,?,?);',
        c.purl,
        c.version,
        c.algorithms,
      ));
    });
    await Promise.all(promises);
  }

  public async findAll() : Promise<Array<Cryptography>> {
    const query = queries.SQL_GET_ALL_CRYPTOGRAPHY;
    const call = await util.promisify(this.connection.all.bind(this.connection)) as any;
    const response = await call(query);
    const crypto = this.cryptographyAdapter(response);
    return crypto;
  }

  public async findAllDetected(): Promise<Array<Cryptography>> {
    const query = queries.SQL_GET_ALL_DETECTED_CRYPTOGRAPHY;
    const call = await util.promisify(this.connection.all.bind(this.connection)) as any;
    const response = await call(query);
    const crypto = this.cryptographyAdapter(response);
    return crypto;
  }

  public async findAllIdentifiedMatched(): Promise<Array<Cryptography>> {
    const query = queries.SQL_GET_ALL_IDENTIFIED_CRYPTOGRAPHY;
    const call = await util.promisify(this.connection.all.bind(this.connection)) as any;
    const response = await call(query);
    const crypto = this.cryptographyAdapter(response);
    return crypto;
  }

  public async deleteAll() {
    const query = queries.SQL_CRYPTOGRAPHY_DELETE_ALL;
    const call = await util.promisify(this.connection.run.bind(this.connection));
    await call(query);
  }

  private cryptographyAdapter(cryptography: Array<{ purl: string, version: string, algorithms: string }>): Array<Cryptography> {
    return cryptography.map((c) => ({ purl: c.purl, version: c.version, algorithms: JSON.parse(c.algorithms) }));
  }
}
