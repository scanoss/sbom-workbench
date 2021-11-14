import Node from './Node';

export default class Folder extends Node {
  private children: Node[];

  constructor(name: string) {
    super(name);
    this.children = [];
  }

  public addChild(node: Node): void {
    this.children.push(node);
  }

  public getChildren(): Node[] {
    return this.children;
  }
}
