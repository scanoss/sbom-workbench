import util from 'util';

import { Model } from './Model';
import { Cryptography } from './entity/Cryptography';
import { Querys } from './querys_db';

export class CryptographyModel extends Model {
  public constructor(path: string) {
    super(path);
  }

  public async insertAll(cryptography: Array<{ purl: string, version: string, algorithms: string }>): Promise<void> {
    const db = await this.openDb();
    const call = util.promisify(db.run.bind(db)) as any;
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
    db.close();
  }

  public async findAll() : Promise<Array<Cryptography>> {
    const db = await this.openDb();
    const query = new Querys().SQL_GET_ALL_CRYPTOGRAPHY;
    const call = await util.promisify(db.all.bind(db)) as any;
    const response = await call(query);
    const crypto = this.cryptographyAdapter(response);
    db.close();
    return crypto;
  }

  public async findAllDetected(): Promise<Array<Cryptography>> {
    const db = await this.openDb();
    const query = new Querys().SQL_GET_ALL_DETECTED_CRYPTOGRAPHY;
    const call = await util.promisify(db.all.bind(db)) as any;
    const response = await call(query);
    const crypto = this.cryptographyAdapter(response);
    db.close();
    return crypto;
  }

  public async findAllIdentifiedMatched(): Promise<Array<Cryptography>> {
    const db = await this.openDb();
    const query = new Querys().SQL_GET_ALL_IDENTIFIED_CRYPTOGRAPHY;
    const call = await util.promisify(db.all.bind(db)) as any;
    const response = await call(query);
    const crypto = this.cryptographyAdapter(response);
    db.close();
    return crypto;
  }

  public async deleteAll() {
    const db = await this.openDb();
    const query = new Querys().SQL_CRYPTOGRAPHY_DELETE_ALL;
    const call = await util.promisify(db.run.bind(db));
    await call(query);
    db.close();
  }

  private cryptographyAdapter(cryptography: Array<{ purl: string, version: string, algorithms: string }>): Array<Cryptography> {
    return cryptography.map((c) => ({ purl: c.purl, version: c.version, algorithms: JSON.parse(c.algorithms) }));
  }
}
