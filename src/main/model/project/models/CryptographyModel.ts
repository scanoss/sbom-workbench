import util from 'util';
import sqlite3 from 'sqlite3';
import { queries } from '../../querys_db';
import { Model } from '../../Model';
import { Algorithms, CryptographicItem, Cryptography, Hint } from '../../entity/Cryptography';

export class CryptographyModel extends Model {
  private connection: sqlite3.Database;

  private tableName = 'cryptography';

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
    const query = queries.SQL_GET_CRYPTOGRAPHY_ALL_DETECTED;
    const call = await util.promisify(this.connection.all.bind(this.connection)) as any;
    const response = await call(query);
    const crypto = this.cryptographyAdapter(response);
    return crypto;
  }

  public async findAllIdentifiedMatched(): Promise<Array<Cryptography>> {
    const query = queries.SQL_GET_CRYPTOGRAPHY_ALL_IDENTIFIED;
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
    const query = queries.SQL_GET_CRYPTOGRAPHY_IDENTIFIED_TYPE_COUNT;
    const call = await util.promisify(this.connection.get.bind(this.connection)) as any;
    const response = await call(query);
    return response.count;
  }

  /**
   * Returns all detected cryptographic elements grouped by type and PURL.
   * @returns {CryptographicItem} Returns array of detected CryptographicItem.
   */
  public async findAllDetectedGroupByType(): Promise<Array<CryptographicItem>> {
    const query = queries.SQL_GET_CRYPTOGRAPHY_DETECTED_GROUPED_BY_TYPE;
    const call = await util.promisify(this.connection.all.bind(this.connection)) as any;
    const results = await call(query);
    return results.map((item: any) => ({
      ...item,
      values: JSON.parse(item.values),
    }));
  }

  /**
   * Returns all identified cryptographic elements grouped by type and PURL.
   * @returns {CryptographicItem} Returns array of identified CryptographicItem.
   * @example [{ name:'pkg:github/scanoss@0.15.0', type:'algorithm', values:['md5', crc32] }]
   */
  public async findAllIdentifiedGroupByType(): Promise<Array<CryptographicItem>> {
    const query = queries.SQL_GET_CRYPTOGRAPHY_IDENTIFIED_GROUPED_BY_TYPE;
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
   * @example [{ name:'pkg:github/scanoss@0.15.0', type:'algorithm', values:['md5', crc32] }]
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
    const query = queries.SQL_GET_CRYPTOGRAPHY_IDENTIFIED_TYPE_SUMMARY;
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
    const query = queries.SQL_GET_CRYPTOGRAPHY_IDENTIFIED_CRYPTO_SUMMARY;
    const call = await util.promisify(this.connection.all.bind(this.connection)) as any;
    const response = await call(query);
    return response.reduce((result: Record<string, number>, item:{ type:string, count: number }) => {
      result[item.type] = item.count;
      return result;
    }, {});
  }

  private cryptographyAdapter(cryptography: Array<{ purl: string, version: string, algorithms: string, hints:string }>): Array<Cryptography> {
    return cryptography.map((c) => ({ purl: c.purl, version: c.version, algorithms: JSON.parse(c.algorithms) as Algorithms[], hints: JSON.parse(c.hints) as Hint[] }));
  }
}
