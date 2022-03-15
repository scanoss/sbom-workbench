import { Model } from '../model/Model';
import { ScanModel } from '../model/ScanModel';

class ModelProdiver {
  private _model: ScanModel;

  private projectPath: string;


  public get model(): ScanModel {
    // eslint-disable-next-line no-underscore-dangle
    return this._model;
  }

  public set model(value: ScanModel) {
    // eslint-disable-next-line no-underscore-dangle
    this._model = value;
  }

  public async init(projectPath: string) {
    await new Model(projectPath).init();
    const model = new ScanModel(projectPath);
    this.model = model;
  }
}

export const modelProvider = new ModelProdiver();
