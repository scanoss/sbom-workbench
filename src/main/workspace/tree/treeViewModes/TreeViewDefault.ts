import Node from '../Node';
import { TreeViewMode } from './TreeViewMode';

export class TreeViewDefault extends TreeViewMode {
  public async getTree(node: Node): Promise<Node> {
    return node;
  }
}
