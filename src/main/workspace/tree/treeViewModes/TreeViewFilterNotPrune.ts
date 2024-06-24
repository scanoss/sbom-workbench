import Node from '../Node';
import { TreeViewFilter } from './TreeViewFilter';
import { DependencyHighlighterVisitor } from '../visitor/DependencyHighlighterVisitor';
import { FilterNodesByStatusVisitor } from '../visitor/FilterNodesByStatusVisitor';
import { HighlightNodesByStatusVisitor } from '../visitor/HighlightNodesByStatusVisitor';

export class TreeViewFilterNotPrune extends TreeViewFilter {
  public async getTree(node: Node): Promise<Node> {
    // TODO: Adjust all the filters to the visitor pattern.
    if (this.filter?.usage === 'dependency') {
      const root = node.getClone();
      root.accept(new DependencyHighlighterVisitor());
      if (this.filter?.status) root.accept(new HighlightNodesByStatusVisitor(this.filter.status.toUpperCase()));
      return root;
    }

    const files = await this.getFiles();
    const tree = node.getClone();
    tree.filter(files);

    return tree;
  }
}
