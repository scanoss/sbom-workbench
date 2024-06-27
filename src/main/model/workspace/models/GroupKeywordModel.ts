import sqlite3 from 'sqlite3';
import util from 'util';
import os from 'os';
import { GroupSearchKeyword } from '../../../../api/types';
import { GroupSearchKeywordDTO } from '../../../../api/dto';


export class GroupKeywordModel {
  private connection: sqlite3.Database;

  constructor(conn: sqlite3.Database) {
    this.connection = conn;
  }

  public setConnection(conn: sqlite3.Database) {
    this.connection = conn;
  }

  private toGroupKeywordEntity( data: Array<{id: number, label: string, keywords: string , createdAt: string, updatedAt: string}>): Array<GroupSearchKeyword>{
    return data.map(group => ({
      id: group.id,
      label: group.label,
      words: JSON.parse(group.keywords) as Array<string>,// Convert keywords from JSON string to JSON array
      createdAt: group.createdAt,
      updatedAt: group.updatedAt 
    }));
  }

  public async get(id: number): Promise<GroupSearchKeyword> {
    const call: any = util.promisify(this.connection.get.bind(this.connection));
    const groups = await call(`SELECT id, label, keywords, createdAt, updatedAt FROM group_keyword WHERE id=? ORDER BY updatedAt DESC;`, id);
    return this.toGroupKeywordEntity([groups])[0];
  }

  public async getAll(): Promise<Array<GroupSearchKeyword>> {
    const call: any = util.promisify(this.connection.all.bind(this.connection));
    const groups = await call(`SELECT id, label, keywords, createdAt, updatedAt FROM group_keyword ORDER BY updatedAt DESC;`);
    return this.toGroupKeywordEntity(groups);
  }

  public async addMany(groups: Array<GroupSearchKeywordDTO>): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      this.connection.serialize(async () => {
        this.connection.run('begin transaction');

        groups.forEach((g) => {
          this.connection.run(
            'INSERT INTO group_keyword (label, keywords) VALUES (?,?);',
            g.label,
            JSON.stringify(g.words),
          );
        });

        this.connection.run('commit', async (err: any) => {
          if (!err) resolve();
          reject(err);
        });
      });
    });
  }

  public async update(group: GroupSearchKeywordDTO): Promise<Array<GroupSearchKeyword>> {
    const call: any = util.promisify(this.connection.run.bind(this.connection));
    await call(`UPDATE group_keyword SET label=?, keywords=?, updatedAt= CURRENT_TIMESTAMP WHERE id=?;`,group.label, JSON.stringify(group.words), group.id);
    return this.getAll();
  }

  public async delete(id: number): Promise<void> {
    const call: any = util.promisify(this.connection.run.bind(this.connection));
    await call(`DELETE FROM group_keyword WHERE id=?;`, id);
  }

}
