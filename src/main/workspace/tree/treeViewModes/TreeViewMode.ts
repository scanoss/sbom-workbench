import Node from '../Node';

export abstract class TreeViewMode {
  public abstract getTree(node: Node): Promise<Node>;
}
