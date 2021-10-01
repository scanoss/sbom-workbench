import * as fs from 'fs';

import { IWorkspaceCfg } from '../../../api/types';
import { WsUtils } from '../WsUtils/WsUtils';
import { IWorkspaceModel } from './IWorkspaceModel';

export class WorkspaceFileModel implements IWorkspaceModel {
  private fileName: string;

  private wsUtils: WsUtils;

  constructor() {
    this.fileName = 'defaultCfg.json';
    this.wsUtils = new WsUtils();
  }

  public async getWSConfig(path: string) {
    const cfg = fs.promises.readFile(`${path}/${this.fileName}`, 'utf8');
    return cfg;
  }

  public async setWSConfig(path: string, config: Partial<IWorkspaceCfg>) {
    try {
      if (await this.wsUtils.fileExist(`${path}/${this.fileName}`)) {
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
