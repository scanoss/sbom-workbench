import log from 'electron-log';
import { IpcEvents } from '../../api/ipc-events';
import { NodeStatus } from '../workspace/Tree/Tree/Node';
import { Tree } from '../workspace/Tree/Tree/Tree';
import { workspace } from '../workspace/Workspace';

class TreeService {
  public init(event: Electron.WebContents, projectPath: string, scanRoot:string): Tree {
    try {
      const tree = new Tree(scanRoot, event);
      tree.buildTree();
      tree.fileTreeFilter(projectPath, scanRoot);
      tree.summarize(scanRoot);
      return tree;
    } catch (e: any) {
      log.error(e);
      throw e;
    }
  }

  public retoreStatus(files: Array<string>) {
    try {
      const project = workspace.getOpenedProjects()[0];
      project.getTree().sendToUI(IpcEvents.TREE_UPDATING, {});
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
      project.getTree().sendToUI(IpcEvents.TREE_UPDATING, {});
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
