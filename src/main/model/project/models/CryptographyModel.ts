import util from 'util';
import sqlite3 from 'sqlite3';
import { queries } from '../../querys_db';
import { Model } from '../../Model';
import { Algorithms, CryptographicItem, Cryptography, Hint } from '../../entity/Cryptography';

export class CryptographyModel extends Model {
  private connection: sqlite3.Database;

  public constructor(conn: sqlite3.Database) {
    super();
    this.connection = conn;
  }

  public async createBatch(cryptography: Array<{ purl: string, version: string, algorithms: Algorithms[], hints: Hint[] }>): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      this.connection.serialize(async () => {
        this.connection.run('begin transaction');
        cryptography.forEach((c) => {
          this.connection.run(
            'INSERT OR IGNORE INTO cryptography (purl, version, algorithms, hints) VALUES(?,?,?,?);',
            c.purl,
            c.version,
            JSON.stringify(c.algorithms),
            JSON.stringify(c.hints),
          );
        });
        this.connection.run('commit', (err: any) => {
          if (!err) resolve();
          reject(err);
        });
      });
    });
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
    const query = queries.SQL_DELETE_CRYPTOGRAPHY;
    const call = await util.promisify(this.connection.run.bind(this.connection));
    await call(query);
  }

  public async identifiedAlgorithmsCount(): Promise<number> {
    const query = queries.SQL_GET_IDENTIFIED_ALGORITHMS_COUNT;
    const call = await util.promisify(this.connection.get.bind(this.connection)) as any;
    const response = await call(query);
    return response.algorithms_count;
  }

  public async detectedAlgorithmsCount(): Promise<number> {
    const query = queries.SQL_GET_DETECTED_ALGORITHMS_COUNT;
    const call = await util.promisify(this.connection.get.bind(this.connection)) as any;
    const response = await call(query);
    return response.algorithms_count;
  }

  public async findAllDetectedGroupByType(): Promise<Array<CryptographicItem>> {
    const query = queries.SQL_GET_ALL_DETECTED_CRYPTO_GROUP_BY_TYPE;
    const call = await util.promisify(this.connection.all.bind(this.connection)) as any;
    const results = await call(query);
    return results.map((item: any) => ({
      ...item,
      value: JSON.parse(item.value),
    }));
  }

  public async findAllIdentifiedGroupByType(): Promise<Array<CryptographicItem>> {
    const query = queries.SQL_GET_ALL_IDENTIFIED_CRYPTO_GROUP_BY_TYPE;
    const call = await util.promisify(this.connection.all.bind(this.connection)) as any;
    const results = await call(query);
    return results.map((item: any) => ({
      ...item,
      value: JSON.parse(item.value),
    }));
  }

  private cryptographyAdapter(cryptography: Array<{ purl: string, version: string, algorithms: string, hints:string }>): Array<Cryptography> {
    return cryptography.map((c) => ({ purl: c.purl, version: c.version, algorithms: JSON.parse(c.algorithms) as Algorithms[], hints: JSON.parse(c.hints) as Hint[] }));
  }
}
