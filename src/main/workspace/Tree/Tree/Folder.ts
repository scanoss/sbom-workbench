import { ChildFriendly } from '@material-ui/icons';
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

  public addComponent(component: string, path: string): boolean {
    if (!path.includes(this.getPath())) return false;

    this.children.forEach((child) => {
      if (child.addComponent(component, path)) {
        child.getComponent().forEach((item) => {         
          const isContained = this.components.some((el) => el.purl === item.purl && el.version === item.version);
          if (isContained === false) {
            this.components.push(item);
          }
        });
      }
    });

    return true;
  }

  public getComponent(): any[] {
    return this.components;
  }
}
