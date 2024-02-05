import { Model } from '../model/Model';
import { ScanModel } from '../model/ScanModel';
import sqlite3 from 'sqlite3';
import path from 'path';
import { Querys } from '../model/querys_db';
import { log } from 'console';

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

  public get getWorkspaceDb(): sqlite3.Database | null {
    return this._workspace;
  }

  public async initWorkspace(wsPath: string) {
    this._workspace = await this.initWorkspaceDb(wsPath);
  }

  public async init(projectPath: string) {
    // Create scan_db
    await new Model(projectPath).init();
    // Init all models
    const model = new ScanModel(projectPath);
    this.model = model;
  }

  private async initWorkspaceDb(wsPath: string) {
    const query = new Querys();
    return new Promise<sqlite3.Database| null>((resolve, reject) => {
      const db = new sqlite3.Database(path.join(wsPath,'workspace.sqlite'), (err: any) => {
        if (err) {
          console.error("Unable to create Workspace DB");
          reject(null);
        } else {
          db.exec(query.WORKSPACE_LOCK,async () => {
            resolve(db);
          });
        }
      });
    });
  }


}

export const modelProvider = new ModelProvider();
