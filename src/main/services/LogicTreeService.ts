import { IpcEvents } from '../../ipc-events';
import { QueryBuilderCreator } from '../queryBuilder/QueryBuilderCreator';
import Node, { NodeStatus } from '../workspace/Tree/Tree/Node';
import { workspace } from '../workspace/Workspace';
import { serviceProvider } from './ServiceProvider';

class LogicTreeService {
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

  public async filterTree(params: any) {
    const project = workspace.getOpenedProjects()[0];
    const queryBuilder = QueryBuilderCreator.create(params);
    const files: any = await serviceProvider.model.file.getAllComponentFiles(queryBuilder);
    const aux = files.map((file: any) => {
      return file.path;    
    });
    const tree =  project.getTree().getRootFolder().getCopy();
  
    tree.filter(aux);
    project.filterTree(tree);
  }
}

export const logictTreeService = new LogicTreeService();
