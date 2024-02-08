import sqlite3 from 'sqlite3';
import util from 'util';
import { queries } from '../querys_db';
import { Connection } from '../Connection';
import { LockModel } from './models/LockModel';

export class WorkspaceModel {

    private connection: sqlite3.Database;

    lock: LockModel;

    private readonly path: string;


    constructor(path: string) {
        this.path = `${path}/workspace.sqlite`;
    }

    private async createWorkspaceTables() {
        const call = util.promisify(this.connection.run.bind(this.connection));
        await call(queries.WORKSPACE_LOCK);
    }

    private initWorkspaceModel(){
      this.lock = new LockModel(this.connection);
    }

    public async init() {
        const conn = new Connection(this.path);
        this.connection = await conn.createDB();
        await this.createWorkspaceTables();
        this.initWorkspaceModel();
        return this.connection;
    }

    public async openDb(): Promise<sqlite3.Database> {
       return this.connection;
    }


    public destroy(){
        this.connection.close();
        this.connection = null;
    }


}
