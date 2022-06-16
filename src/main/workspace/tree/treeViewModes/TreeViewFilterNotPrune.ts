import Node from '../Node';
import { TreeViewFilter } from './TreeViewFilter';

export class TreeViewFilterNotPrune extends TreeViewFilter {
  public async getTree(node: Node): Promise<Node>{
    const files = await this.getFiles();
    const tree = node.getClone();
    tree.filter(files);
    return tree;
  }
}
