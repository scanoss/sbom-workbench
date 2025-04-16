import util from 'util';
import sqlite3 from 'sqlite3';
import { Model } from '../../Model';
import { queries } from '../../querys_db';
import { LocalCryptography } from '../../entity/LocalCryptography';
import { CryptographicItem } from '../../entity/Cryptography';

export interface ILocalCryptographyModel {
  id: number;
  file_id: number;
  path: string;
  algorithms: string;
  type: string;
}

export class LocalCryptographyModel extends Model {
  private connection: sqlite3.Database;

  private tableName = 'local_cryptography';

  public constructor(conn: sqlite3.Database) {
    super();
    this.connection = conn;
  }

  public async import(cryptography: Array<{ fileId: number, algorithms: string, hints:any[] }>): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      this.connection.serialize(async () => {
        this.connection.run('begin transaction');

        cryptography.forEach((c) => {
          this.connection.run(
            'INSERT OR IGNORE INTO local_cryptography (file_id, algorithms, hints) VALUES(?,?,?);',
            c.fileId,
            c.algorithms,
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

  public async deleteAll() {
    const query = queries.SQL_DELETE_LOCAL_CRYPTOGRAPHY_ALL;
    const call = await util.promisify(this.connection.run.bind(this.connection));
    await call(query);
  }

  /**
   * Returns the total count of detected cryptographic elements.
   * @returns {number} The total count of all detected cryptographic types (algorithms, libraries, protocol, etc.).
   */
  public async detectedTypeCount(): Promise<number> {
    const query = queries.SQL_GET_CRYPTO_DETECTED_TYPE_COUNT.replaceAll('#TABLE', this.tableName);
    const call = await util.promisify(this.connection.get.bind(this.connection)) as any;
    const response = await call(query);
    return response.count;
  }

  /**
   * Returns the total count of identified cryptographic elements.
   * @returns {number} The total count of all identified cryptographic types (algorithms, libraries, protocol, etc.).
   */
  public async identifiedTypeCount(): Promise<number> {
    const query = queries.SQL_GET_LOCAL_CRYPTOGRAPHY_IDENTIFIED_TYPE_COUNT;
    const call = await util.promisify(this.connection.get.bind(this.connection)) as any;
    const response = await call(query);
    return response.count;
  }

  /**
   * Returns all detected cryptographic elements grouped by type and file path.
   * @returns {CryptographicItem} Returns array of detected CryptographicItem.
   * @example [{ name:'/main.c', type:'algorithm', values:['md5', crc32] }]
   */
  public async findAllDetectedGroupByType(): Promise<Array<CryptographicItem>> {
    const query = queries.SQL_GET_LOCAL_CRYPTOGRAPHY_ALL_GROUPED_BY_TYPE;
    const call = await util.promisify(this.connection.all.bind(this.connection)) as any;
    const results = await call(query);
    return results.map((item: any) => ({
      ...item,
      values: JSON.parse(item.values),
    }));
  }

  /**
   * Returns all identified cryptographic elements grouped by type and file path.
   * @returns {CryptographicItem} Returns array of identified CryptographicItem.
   * @example [{ name:'/main.c', type:'algorithm', values:['md5', crc32] }]
   */
  public async findAllIdentifiedGroupByType(): Promise<Array<CryptographicItem>> {
    const query = queries.SQL_GET_LOCAL_CRYPTOGRAPHY_ALL_IDENTIFIED_GROUPED_BY_TYPE;
    const call = await util.promisify(this.connection.all.bind(this.connection)) as any;
    const results = await call(query);
    return results.map((item: any) => ({
      ...item,
      values: JSON.parse(item.values),
    }));
  }

  /**
   * @brief Returns a summary of detected cryptography types as a record.
   * @returns {Record<string, number>} An object where keys are cryptography types and values are their counts.
   * @example { algorithm: 10, library: 2 }
   */
  public async getDetectedTypeSummary(): Promise<Record<string, number>> {
    const query = queries.SQL_GET_DETECTED_CRYPTO_TYPE_SUMMARY.replaceAll('#TABLE', this.tableName);
    const call = await util.promisify(this.connection.all.bind(this.connection)) as any;
    const response = await call(query);
    return response.reduce((result: Record<string, number>, item:{ type:string, count: number }) => {
      result[item.type] = item.count;
      return result;
    }, {});
  }

  /**
   * @brief Returns a summary of identified cryptography types as a record.
   * @returns {Record<string, number>} An object where keys are cryptography types and values are their counts.
   * @example { algorithm: 10, library: 2 }
   */
  public async getIdentifiedTypeSummary(): Promise<Record<string, number>> {
    const query = queries.SQL_GET_LOCAL_CRYPTOGRAPHY_IDENTIFIED_TYPE_SUMMARY;
    const call = await util.promisify(this.connection.all.bind(this.connection)) as any;
    const response = await call(query);
    return response.reduce((result: Record<string, number>, item:{ type:string, count: number }) => {
      result[item.type] = item.count;
      return result;
    }, {});
  }

  /**
   * @brief Returns a summary of detected cryptography as a record.
   * @returns {Record<string, number>} An object where keys are cryptography types and values are their counts.
   * @example { md5: 10, openssl: 2 }
   */
  public async getDetectedCryptoSummary(): Promise<Record<string, number>> {
    const query = queries.SQL_GET_DETECTED_CRYPTO_SUMMARY.replaceAll('#TABLE', this.tableName);
    const call = await util.promisify(this.connection.all.bind(this.connection)) as any;
    const response = await call(query);
    return response.reduce((result: Record<string, number>, item:{ crypto:string, count: number }) => {
      result[item.crypto] = item.count;
      return result;
    }, {});
  }

  /**
   * @brief Returns a summary of identified cryptography as a record.
   * @returns {Record<string, number>} An object where keys are cryptography types and values are their counts.
   * @example { md5: 10, openssl: 2 }
   */
  public async getIdentifiedCryptoSummary(): Promise<Record<string, number>> {
    const query = queries.SQL_GET_LOCAL_CRYPTOGRAPHY_IDENTIFIED_CRYPTO_SUMMARY;
    const call = await util.promisify(this.connection.all.bind(this.connection)) as any;
    const response = await call(query);
    return response.reduce((result: Record<string, number>, item:{ crypto:string, count: number }) => {
      result[item.crypto] = item.count;
      return result;
    }, {});
  }
}
