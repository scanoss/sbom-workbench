import sqlite3 from 'sqlite3';
import util from 'util';
import { queries } from '../querys_db';
import { Connection } from '../Connection';
import { LockModel } from './models/LockModel';

export class WorkspaceModel {
  private connection: Connection;

  lock: LockModel;

  private readonly path: string;

  constructor(path: string) {
    this.path = `${path}/workspace.sqlite`;
  }

  private async createWorkspaceTables(db: sqlite3.Database) {
    const call = util.promisify(db.run.bind(db));
    await call(queries.WORKSPACE_LOCK);
  }

  private async initWorkspaceModel(db: sqlite3.Database) {
    this.lock = new LockModel(db);
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
    return db;
  }

  public async destroy() {
    if (this.connection) await this.connection.close();
    this.connection = null;
  }
}
