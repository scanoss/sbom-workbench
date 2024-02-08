import { ProjectModel } from '../model/project/ProjectModel';
import { WorkspaceModel } from '../model/workspace/WorkspaceModel';


class ModelProvider {
  private _model: ProjectModel;

  private _workspace: WorkspaceModel;

  private projectPath: string;

  // TODO: Change model by project
  public get model(): ProjectModel {
    // eslint-disable-next-line no-underscore-dangle
    return this._model;
  }

  public set model(value: ProjectModel) {
    // eslint-disable-next-line no-underscore-dangle
    this._model = value;
  }

  public get workspace():WorkspaceModel {
    return this._workspace;
  }

  public async initWorkspaceModel(wsPath: string) {
    const workspaceModel = new WorkspaceModel(wsPath);
    await workspaceModel.init();
    this._workspace = workspaceModel;

  }

  public async init(projectPath: string) {
    const model = new ProjectModel(projectPath);
    await model.init();
    this._model = model;
  }

}

export const modelProvider = new ModelProvider();
