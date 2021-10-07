import * as fs from 'fs';

import { IWorkspaceCfg } from '../../../api/types';
import { IWorkspaceModel } from './IWorkspaceModel';
import { wsUtils } from '../WsUtils/WsUtils';

export class WorkspaceFileModel implements IWorkspaceModel {
  private fileName: string;

  private path: string;

  constructor() {
    this.fileName = 'defaultCfg.json';
  }

  public setPath(path: string){
    this.path=path;
  }

  public async getWSConfig(path: string): Promise<IWorkspaceCfg> {
    const cfg = await fs.promises.readFile(`${path}/${this.fileName}`, 'utf8');
    return JSON.parse(cfg);
  }

  public async setWSConfig(path: string, config: Partial<IWorkspaceCfg>) {
    try {
      if (await wsUtils.fileExist(`${path}/${this.fileName}`)) {
        const file = fs.promises.readFile(`${path}/${this.fileName}`);
        const aux = { ...file, ...config };
        fs.promises.writeFile(`${path}/${this.fileName}`, JSON.stringify(aux, undefined, 2));
      } else {
        fs.promises.writeFile(`${path}/${this.fileName}`, JSON.stringify(config, undefined, 2));
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}
