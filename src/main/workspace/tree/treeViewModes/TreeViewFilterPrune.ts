
import Folder from '../Folder';
import Node from '../Node';
import { TreeViewFilter } from './TreeViewFilter';

export class TreeViewFilterPrune extends TreeViewFilter {
  public async getTree(node: Node): Promise<Node> {
    const files = await this.getFiles();
    let tree = node.getClonePath(files);
    if (!tree) {
      tree = new Folder('', node.getLabel());
    }
    return tree;
  }
}
