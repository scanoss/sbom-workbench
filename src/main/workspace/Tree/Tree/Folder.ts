import Node from './Node';

export default class Folder extends Node {
  private children: Node[];

  constructor(path: string, label: string) {
    super(path, label);
    this.children = [];
  }

  public addChild(node: Node): void {
    this.children.push(node);
  }

  public getChildren(): Node[] {
    return this.children;
  }

  public addComponent(component: string, path: string): void {
    this.children.forEach((child) => {
      child.addComponent(component, path);
    });
  }
}
