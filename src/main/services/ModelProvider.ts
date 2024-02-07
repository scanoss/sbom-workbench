import { Model } from '../model/Model';
import { ScanModel } from '../model/ScanModel';
import sqlite3 from 'sqlite3';
import path from 'path';
import { Querys } from '../model/querys_db';
import { log } from 'console';
import * as util from 'util';
import { workspace } from '../../main/workspace/Workspace';

class ModelProvider {
  private _model: ScanModel;

  private _workspace: sqlite3.Database | null;

  private projectPath: string;


  public get model(): ScanModel {
    // eslint-disable-next-line no-underscore-dangle
    return this._model;
  }

  public set model(value: ScanModel) {
    // eslint-disable-next-line no-underscore-dangle
    this._model = value;
  }

  public get getWorkspaceDb():sqlite3.Database {
    return this._workspace;
  }

  public async initWorkspace(wsPath: string) {
    this._workspace = await this.initWorkspaceDb(wsPath);
  }

  public async init(projectPath: string) {
    // Create scan_db
    await new Model(projectPath).initScanDb();
    // Init all models
    const model = new ScanModel(projectPath);
    this.model = model;
  }

  private async initWorkspaceDb(wsPath: string) {
    const query = new Querys();
    const db = await Model.createDB(path.join(wsPath,'workspace.sqlite'));
    const call = util.promisify(db.run.bind(db));
    await call(query.WORKSPACE_LOCK);
    return db;   
  }


}

export const modelProvider = new ModelProvider();
