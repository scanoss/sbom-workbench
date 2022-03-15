import { IpcEvents } from '../../api/ipc-events';
import { NodeStatus } from '../workspace/Tree/Tree/Node';
import { workspace } from '../workspace/Workspace';

class TreeService {
  public retoreStatus(files: Array<string>) {
    try {
      const project = workspace.getOpenedProjects()[0];
      project.sendToUI(IpcEvents.TREE_UPDATING, {});
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
      project.sendToUI(IpcEvents.TREE_UPDATING, {});
      paths.forEach((path) => {
        project.getTree().getRootFolder().setStatus(path, status);
      });
      project.updateTree();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}

export const treeService = new TreeService();
