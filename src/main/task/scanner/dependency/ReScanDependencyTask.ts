import { rescanService } from '../../../services/RescanService';
import { treeService } from '../../../services/TreeService';
import { NodeStatus } from '../../../workspace/tree/Node';
import { modelProvider } from '../../../services/ModelProvider';
import { DependencyTask } from './DependencyTask';

export class ReScanDependencyTask extends DependencyTask {
  // @Override
  public async run(params: void): Promise<boolean> {
    // Capture IGNORED state and user-edited version/licenses before super.run()
    // wipes the dependencies table. Re-applied by natural identity (purl,
    // originalVersion, originalLicense) so manifest content changes correctly
    // invalidate stale decisions.
    const userDecisionsSnapshot = await modelProvider.model.dependency.getUserDecisionsSnapshot();

    await super.run();

    await modelProvider.model.dependency.applyUserDecisionsSnapshot(userDecisionsSnapshot);

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
