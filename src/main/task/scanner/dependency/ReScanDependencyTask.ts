import { rescanService } from '../../../services/RescanService';
import { treeService } from '../../../services/TreeService';
import { NodeStatus } from '../../../workspace/tree/Node';
import { modelProvider } from '../../../services/ModelProvider';
import { DependencyTask } from './DependencyTask';

export class ReScanDependencyTask extends DependencyTask {
  // @Override
  public async run(params: void): Promise<boolean> {
    await super.run();

    // Delete dirty dependencies inventories
    await modelProvider.model.inventory.deleteDirtyDependencyInventories();

    // Delete unused components
    await rescanService.deleteUnusedComponents();

    // Update the dependencies status on file tree
    await this.updateDependenciesOnFileTree();

    return true;
  }

  private async updateDependenciesOnFileTree() {
    const rootFolder = this.project.tree?.getRootFolder();
    if (!rootFolder) {
      throw new Error('Cannot update dependency status: project tree is not initialized');
    }

    const dep = await treeService.getDependencyStatus();
    dep.forEach((d) => {
      rootFolder.setStatus(d.path, d.status as NodeStatus);
    });
    this.project.saveWithSnapshot();
  }
}
