import sqlite3 from 'sqlite3';
import util from 'util';
import os from 'os';

export interface GroupKeyword  {
    id: number;
    label: string;
    words: Array<string>;
  }

export class GroupKeywordModel {
    private connection: sqlite3.Database;
  
    constructor(conn: sqlite3.Database) {
      this.connection = conn;
    }
  
    public setConnection(conn: sqlite3.Database) {
      this.connection = conn;
    }

    public async getAll(): Promise<GroupKeyword> {
        const call: any = util.promisify(this.connection.all.bind(this.connection));
        const groups = await call('SELECT id, label, json(keywords) as keywords FROM groupKeyword;'); 
        return groups;
      }
}