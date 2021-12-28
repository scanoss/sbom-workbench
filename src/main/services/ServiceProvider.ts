import { ScanModel } from '../db/ScanModel';

class ServiceProdiver {
  private _model: ScanModel;

  public setModel(model: ScanModel) {
    // eslint-disable-next-line no-underscore-dangle
    this._model = model;
  }

  public get model(): ScanModel {
    // eslint-disable-next-line no-underscore-dangle
    return this._model;
  }
}

export const serviceProvider = new ServiceProdiver();
