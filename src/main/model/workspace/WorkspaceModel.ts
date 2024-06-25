import sqlite3 from 'sqlite3';
import util from 'util';
import { queries } from '../querys_db';
import { Connection } from '../Connection';
import { LockModel } from './models/LockModel';
import { GroupKeywordModel } from './models/GroupKeywordModel';

export class WorkspaceModel {
  private connection: Connection;

  lock: LockModel;
  groupKeywoard: GroupKeywordModel;

  private readonly path: string;

  constructor(path: string) {
    this.path = `${path}/workspace.sqlite`;
  }

  private async createWorkspaceTables(db: sqlite3.Database) {
    const call = util.promisify(db.exec.bind(db));
    await call(queries.WORKSPACE_DB);
  }

  private async initWorkspaceModel(db: sqlite3.Database) {
    this.lock = new LockModel(db);
    this.groupKeywoard = new GroupKeywordModel(db);

  }

  public async init() {
    await this.createWorkspaceDB();
    const db = await this.connection.openDb();
    await this.createWorkspaceTables(db);
    await this.initWorkspaceModel(db);
    await this.destroy();
  }

  private async createWorkspaceDB() {
    this.connection = new Connection(this.path);
    await this.connection.createDB();
  }

  public async openDb(): Promise<sqlite3.Database> {
    await this.destroy();
    this.connection = new Connection(this.path);
    const db = await this.connection.openDb();
    this.lock.setConnection(db);
    this.groupKeywoard.setConnection(db);
    return db;
  }

  public async destroy() {
    if (this.connection) await this.connection.close();
    this.connection = null;
  }
}
