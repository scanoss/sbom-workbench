import { ComponentSource, IWorkbenchFilter } from '../../api/types';
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

  public async filterTree(params: IWorkbenchFilter) {
    const project = workspace.getOpenedProjects()[0];
    let tree = null;
    if (!params || (params.source === ComponentSource.ENGINE && Object.keys(params).length === 1)) {
      tree = project.getTree().getRootFolder();
    } else {
      const queryBuilder = QueryBuilderCreator.create({ ...params, path: null });
      const files: any = await serviceProvider.model.file.getAllComponentFiles(queryBuilder);
      const aux = files.map((file: any) => {
        return file.path;
      });
      tree = project.getTree().getRootFolder().getCopy();
      tree.filter(aux);
    }
    project.filterTree(tree);
  }
}

export const logictTreeService = new LogicTreeService();
