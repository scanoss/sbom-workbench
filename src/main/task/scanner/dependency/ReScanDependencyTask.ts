import fs from 'fs';
import { Tree } from '../../../workspace/tree/Tree';
import { rescanService } from '../../../services/RescanService';
import { treeService } from '../../../services/TreeService';
import { NodeStatus } from '../../../workspace/tree/Node';
import { modelProvider } from '../../../services/ModelProvider';
import { DependencyTask } from './DependencyTask';

export class






ReScanDependencyTask extends DependencyTask {
  // @Override
  public async run(params: void): Promise<boolean> {
    await super.run();

    // Delete dirty dependencies inventories
    await modelProvider.model.inventory.deleteDirtyDependencyInventories();

    // Delete unused components
    await rescanService.deleteUnusedComponents();

    // Update the dependencies status on file tree
    await this.updateDependenciesOnFileTree(this.project.getMyPath());

    return true;
  }

  private async updateDependenciesOnFileTree(projectPath: string) {
    // update dependency status on file tree
    const m = await fs.promises.readFile(`${projectPath}/metadata.json`, 'utf8');
    const metadata = JSON.parse(m);
    const fileTree = await fs.promises.readFile(`${projectPath}/tree.json`, 'utf8');
    const treeParsed = JSON.parse(fileTree);
    const tree = new Tree(metadata.name, projectPath, metadata.scan_root);
    tree.loadTree(treeParsed.tree.rootFolder);
    const dep = await treeService.getDependencyStatus();
    dep.forEach((d) => {
      tree.getRootFolder().setStatus(d.path, d.status as NodeStatus);
    });
    const n = await tree.getTree();
    treeParsed.tree.rootFolder = n;
    await fs.promises.writeFile(`${projectPath}/tree.json`, JSON.stringify(treeParsed), 'utf-8');
  }
}
