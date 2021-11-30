import { workspace } from '../workspace/Workspace';

class LogicTreeService {
  public async retoreStatus(files: Array<string>) {
    try {        
      const project = workspace.getOpenedProjects()[0];         
      project.getTree().restoreStatus(files);
      project.updateTree();
      return true;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}

export const logictTreeService = new LogicTreeService();
