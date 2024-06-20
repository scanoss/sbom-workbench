import Folder from '../Folder';
import Node from '../Node';
import { TreeViewFilter } from './TreeViewFilter';
import { OnlyKeepDependencyVisitor } from '../visitor/OnlyKeepDependencyVisitor';

export class TreeViewFilterPrune extends TreeViewFilter {
  public async getTree(node: Node): Promise<Node> {

    // TODO: Adjust all the filters to the visitor pattern.
    if (this.filter?.usage === 'dependency') {
      const root = node.getClone();
      root.accept(new OnlyKeepDependencyVisitor());
      return root;
    }

    const files = await this.getFiles();
    let tree = node.getClonePath(files);
    if (!tree) {
      tree = new Folder('', node.getLabel());
    }
    return tree;
  }
}
