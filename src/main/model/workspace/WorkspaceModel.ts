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

  private async createWorkspaceTables() {
    const db = await this.connection.openDb();
    const call = util.promisify(db.run.bind(db));
    await call(queries.WORKSPACE_LOCK);
  }

  private async initWorkspaceModel() {
    const db = await this.connection.openDb();
    this.lock = new LockModel(db);
  }

  public async init() {
    await this.createWorkspaceDB();
    await this.createWorkspaceTables();
    await this.initWorkspaceModel();
    await this.destroy();
  }

  private async createWorkspaceDB() {
    this.connection = new Connection(this.path);
    await this.connection.createDB();
    return this.connection;
  }

  public async openDb(): Promise<sqlite3.Database> {
    await this.destroy();
    this.connection = await new Connection(this.path);
    const db = await this.connection.openDb();
    this.lock.setConnection(db);
    return db;
  }

  public async destroy() {
    if (this.connection) await this.connection.close();
    this.connection = null;
  }
}
