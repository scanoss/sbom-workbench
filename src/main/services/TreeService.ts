import log from 'electron-log';
import { IpcChannels } from '../../api/ipc-channels';
import { NodeStatus } from '../workspace/tree/Node';
import { Tree } from '../workspace/tree/Tree';
import { workspace } from '../workspace/Workspace';
import { utilHelper } from '../helpers/UtilHelper';
import { FilterTrue } from '../batch/Filter/FilterTrue';
import { modelProvider } from './ModelProvider';

class TreeService {
  private updateStatus(paths: Array<string>, status: NodeStatus) {
    try {
      const project = workspace.getOpenedProjects()[0];
      paths.forEach((path) => {
        project.getTree().getRootFolder().setStatus(path, status);
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  public updateStart(): void {
    const project = workspace.getOpenedProjects()[0];
    project.getTree().sendToUI(IpcChannels.TREE_UPDATING, {});
  }

  public updateDone(): void {
    const project = workspace.getOpenedProjects()[0];
    project.updateTree();
  }

  public async updateTree(ids: Array<number>, status: NodeStatus): Promise<boolean> {
    this.updateStart();
    return modelProvider.model.result
      .getSummaryByids(ids)
      .then((results) => {
        const paths = utilHelper.getArrayFromObjectFilter(results, 'path', new FilterTrue()) as Array<string>;
        this.updateStatus(paths, status);
        this.updateDependencyStatus();
        return true;
      })
      .catch((error) => {
        throw error;
      });
  }

  private async getDependencyStatus(): Promise<Array<Record<string, any>>> {
    const dependencies = await modelProvider.model.dependency.getStatus(); // getAll
    const dep = this.mapToDependencyStatus(dependencies);
    return dep;
  }

  private mapToDependencyStatus(dependencies): Array<Record<string, any>> {
    // Group path and dependencies status
    const status = {};
    dependencies.forEach((item) => {
      if (!status[item.path]) {
        const aux = new Set();
        aux.add(item.status);
        status[item.path] = {
          status: aux,
          fileId: item.fileId,
        };
      } else status[item.path].status.add(item.status);
    });
    // Get dependencies status for each path
    const dependencyStatus = [];
    for (const [path, data] of Object.entries(status as Record<string, any>)) {
      let depStat = '';
      if (data.status.has('IGNORED')) depStat = 'IGNORED';
      if (data.status.has('IDENTIFIED')) depStat = 'IDENTIFIED';
      if (data.status.has('PENDING')) depStat = 'PENDING';
      dependencyStatus.push({
        path,
        fileId: data.fileId,
        status: depStat,
      });
    }
    return dependencyStatus;
  }

  public updateDependencyStatusOnTree() {
    this.updateStart();
    this.updateDependencyStatus();
  }

  private async updateDependencyStatus(): Promise<boolean> {
    this.getDependencyStatus().then((dep) => {
      const depGroupedByStatus = dep.reduce((acc, item) => {
        if (!acc[item.status]) {
          acc[item.status] = [];
        }
        acc[item.status].push(item.fileId);
        return acc;
      }, {});
      // Update file status on database
      if (depGroupedByStatus.PENDING) modelProvider.model.file.restore(depGroupedByStatus.PENDING);
      if (depGroupedByStatus.IDENTIFIED) modelProvider.model.file.identified(depGroupedByStatus.IDENTIFIED);
      if (depGroupedByStatus.IGNORED) modelProvider.model.file.ignored(depGroupedByStatus.IGNORED);
      // Update file status on fileTree
      dep.forEach((d) => {
        this.updateStatus([d.path], d.status as NodeStatus);
      });
      this.updateDone();
    });
    return true;
  }

  public retoreStatus(files: Array<number>) {
    try {
      modelProvider.model.result
        .getSummaryByids(files)
        .then((files: any) => {
          const paths = utilHelper.getArrayFromObjectFilter(files, 'path', new FilterTrue()) as Array<string>;
          const project = workspace.getOpenedProjects()[0];
          project.getTree().sendToUI(IpcChannels.TREE_UPDATING, {});
          project.getTree().restoreStatus(paths);
          project.updateTree();
          return true;
        })
        .catch((e) => {
          throw e;
        });
      return true;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

}

export const treeService = new TreeService();
