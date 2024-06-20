import Node from '../Node';
import { TreeViewFilter } from './TreeViewFilter';
import { DependencyHighlighterVisitor } from '../visitor/DependencyHighlighterVisitor';

export class TreeViewFilterNotPrune extends TreeViewFilter {
  public async getTree(node: Node): Promise<Node> {
    // TODO: Adjust all the filters to the visitor pattern.
    if (this.filter?.usage === 'dependency') {
      const root = node.getClone();
      root.accept(new DependencyHighlighterVisitor());
      return root;
    }

    const files = await this.getFiles();
    const tree = node.getClone();
    tree.filter(files);

    return tree;
  }
}
