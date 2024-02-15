/* eslint-disable no-underscore-dangle */
import sqlite3 from 'sqlite3';
import { ProjectModel } from '../model/project/ProjectModel';
import { WorkspaceModel } from '../model/workspace/WorkspaceModel';

class ModelProvider {
  private _model: ProjectModel;

  private _workspace: WorkspaceModel;

  private projectPath: string;

  private _openModeProjectModel: number = sqlite3.OPEN_READWRITE;

  // TODO: Change model by project
  public get model(): ProjectModel {
    // eslint-disable-next-line no-underscore-dangle
    return this._model;
  }

  public set model(value: ProjectModel) {
    // eslint-disable-next-line no-underscore-dangle
    this._model = value;
  }

  public set openModeProjectModel(mode: number) {
    // eslint-disable-next-line no-underscore-dangle
    this._openModeProjectModel = mode;
  }

  public get workspace():WorkspaceModel {
    // eslint-disable-next-line no-underscore-dangle
    return this._workspace;
  }

  public async initWorkspaceModel(wsPath: string) {
    const workspaceModel = new WorkspaceModel(wsPath);
    await workspaceModel.init();
    // eslint-disable-next-line no-underscore-dangle
    this._workspace = workspaceModel;
  }

  public async init(projectPath: string) {
    const model = new ProjectModel(projectPath);
    // eslint-disable-next-line no-underscore-dangle
    await model.init(this._openModeProjectModel);
    this._model = model;
  }
}

export const modelProvider = new ModelProvider();
