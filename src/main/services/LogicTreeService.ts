import { NodeStatus } from '../workspace/Tree/Tree/Node';
import { workspace } from '../workspace/Workspace';

class LogicTreeService {
  public retoreStatus(files: Array<string>) {
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

  public updateStatus(paths: Array<string>, status: NodeStatus) {
    try {
      const project = workspace.getOpenedProjects()[0];
      paths.forEach(path => {
        project.getTree().getRootFolder().setStatus(path, status);
      });
      project.updateTree();    
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}

export const logictTreeService = new LogicTreeService();
