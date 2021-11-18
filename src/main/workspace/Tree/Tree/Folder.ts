import { ChildFriendly } from '@material-ui/icons';
import Node from './Node';

export default class Folder extends Node {
  private children: Node[];

  constructor(path: string, label: string) {
    super(path, label);
    this.children = [];
    this.type = 'folder';
  }

  public addChild(node: Node): void {
    this.children.push(node);
  }

  public getChildren(): Node[] {
    return this.children;
  }

  public updateStatus(path: string, status: string): boolean {
    if (!path.includes(this.getPath())) return false;
    if (path === this.getPath()) return false;

    for (const child of this.children) {
      if (child.updateStatus(path, status)) break;
    }

    let newFolderState = 'identified';
    if (this.children.some((child) => child.getStatus() === 'pending')) newFolderState = 'pending';
    if (this.children.every((child) => child.getStatus() === 'ignored')) newFolderState = 'ignored';

    this.status = newFolderState;
    this.setStatusOnClassnameAs(newFolderState);

    return true;
  }


  public updateClassName(path: string, status: string): boolean {
    throw new Error('Method not implemented.');
  }

  public getNode(path: string): Node {
    if (!path.includes(this.getPath())) return null;

    if (path === this.getPath()) return this;

    for (const child of this.children) {
      const node = child.getNode(path);
      if (node !== null) return node;
    }
    return null;
  }

  public addComponent(component: any, path: string): boolean {
    if (!path.includes(this.getPath())) return false;

    const existComponent = this.components.some((el) => el.purl === component.purl && el.version === component.version);
    if (!existComponent) this.components.push(component);

    for (const child of this.children)
      if (child.addComponent(component, path)) break;
    return true;
  }

  public getComponent(): any[] {
    return this.components;
  }
}
