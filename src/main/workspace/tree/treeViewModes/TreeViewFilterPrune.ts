import Folder from '../Folder';
import Node from '../Node';
import { TreeViewFilter } from './TreeViewFilter';
import { OnlyKeepDependencyVisitor } from '../visitor/OnlyKeepDependencyVisitor';
import { FilterNodesByStatusVisitor } from '../visitor/FilterNodesByStatusVisitor';

export class TreeViewFilterPrune extends TreeViewFilter {
  public async getTree(node: Node): Promise<Node> {
    // TODO: Adjust all the filters to the visitor pattern.
    if (this.filter?.usage === 'dependency') {
      const root = node.getClone();
      root.accept(new OnlyKeepDependencyVisitor());
      if (this.filter?.status) root.accept(new FilterNodesByStatusVisitor(this.filter.status.toUpperCase()));
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
