import { IWorkspaceCfg } from '../../../api/types';

export interface IWorkspaceModel {

  getWSConfig(path: string);

  setWSConfig(path: string, config: Partial<IWorkspaceCfg>);
}
