import { Sequelize } from 'sequelize-typescript';
import fs from 'fs';
import { app } from 'electron';
import path from 'path';
import { Model } from '../model/Model';
import { ScanModel } from '../model/ScanModel';
import { License } from '../model/entity/License';
import { Version } from '../model/entity/Version';
import { Component } from '../model/entity/Component';
import { LicenseVersion } from '../model/entity/LicenseVersion';

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

  public set model(value: ScanModel) {
    // eslint-disable-next-line no-underscore-dangle
    this._model = value;
  }

  public async init(projectPath: string) {
    await new Model().init(`${projectPath}/${this.PROJECT_MODEL}`);
    const model = new ScanModel(projectPath);
    this.model = model;
  }

  public async initWorkspaceModel(wsPath: string) {
    await new Model().createDb(`${wsPath}/${this.WORKSPACE_MODEL}`); // TODO: move to migration
      // eslint-disable-next-line no-underscore-dangle
      const sequelize = new Sequelize({
        database: this.WORKSPACE_MODEL,
        dialect: 'sqlite',
        storage: `${wsPath}/${this.WORKSPACE_MODEL}`,
      });
      await sequelize.addModels([License,Version,Component,LicenseVersion]);
      // await sequelize.sync({ force: false }); // TODO: Move to Migration
      this._workspaceModel = sequelize;
      await this.importGlobalLicenses();
  }

  private async importGlobalLicenses() { // TODO: Move to migrations
   if(await License.count() <= 0) {
     const RESOURCES_PATH = app.isPackaged
       ? path.join(process.resourcesPath, 'assets/data/licenses.json')
       : path.join(__dirname, '../../../assets/data/licenses.json');
     const licenses = await fs.promises.readFile(RESOURCES_PATH, 'utf-8');
     await License.bulkCreate(JSON.parse(licenses));
   }
  }
}

export const modelProvider = new ModelProvider();
