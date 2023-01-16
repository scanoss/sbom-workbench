import { Sequelize, DataType } from 'sequelize-typescript';
import fs from 'fs';
import { app } from 'electron';
import path from 'path';
import { Model } from '../model/Model';
import { ScanModel } from '../model/ScanModel';
import { License } from '../model/ORModel/License';
import { Version } from '../model/ORModel/Version';
import { Component } from '../model/ORModel/Component';
import { LicenseVersion } from '../model/ORModel/LicenseVersion';

class ModelProvider {
  private readonly  PROJECT_MODEL: string = 'scan_db';

  private  readonly  WORKSPACE_MODEL: string = 'workspace.sqlite3';

  private _model: ScanModel;

  private _workspaceModel: Sequelize;

  public get model(): ScanModel {
    // eslint-disable-next-line no-underscore-dangle
    return this._model;
  }

  public get workspaceModel(): Sequelize {
    // eslint-disable-next-line no-underscore-dangle
    return this._workspaceModel;
  }

  public set workspaceModel(value: Sequelize) {
    // eslint-disable-next-line no-underscore-dangle
    this._workspaceModel = value;
  }

  public set model(value: ScanModel) {
    // eslint-disable-next-line no-underscore-dangle
    this._model = value;
  }

  public async init(projectPath: string) {
    await new Model(`${projectPath}/${this.PROJECT_MODEL}`).init();
    const model = new ScanModel(`${projectPath}/${this.PROJECT_MODEL}`);
    this.model = model;
  }
}

export const modelProvider = new ModelProvider();
