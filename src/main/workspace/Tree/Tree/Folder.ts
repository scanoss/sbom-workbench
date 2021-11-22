import Node, { NodeStatus } from './Node';


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

  // public updateStatus(path: string, status: string): boolean {
  //   if (!path.includes(this.getPath())) return false;
  //   if (path === this.getPath()) return false;

  //   for (const child of this.children) {
  //     if (child.updateStatus(path, status)) break;
  //   }

  //   let newFolderState = 'identified';
  //   if (this.children.some((child) => child.getStatus() === 'pending')) newFolderState = 'pending';
  //   if (this.children.every((child) => child.getStatus() === 'ignored')) newFolderState = 'ignored';

  //   this.status = newFolderState;
  //   this.setStatusOnClassnameAs(newFolderState);

  //   return true;
  // }

  public getStatus(path: string): NodeStatus {

    if (!path.includes(this.getPath())) return null;


    return this.statusLogic();

  }

  private statusLogic(): NodeStatus {
    if (this.children.some((child) => child.status === NodeStatus.PENDING)) return NodeStatus.PENDING;
    if (this.children.some((child) => child.status === NodeStatus.IDENTIFIED)) return NodeStatus.IDENTIFIED;
    if (this.children.some((child) => child.status === NodeStatus.IGNORED)) return NodeStatus.IGNORED;
    if (this.children.some((child) => child.status === NodeStatus.NOMATCH)) return NodeStatus.NOMATCH;
    return NodeStatus.FILTERED;
  }

  public setStatus(path: string, status: NodeStatus): boolean {
    if (path === this.getPath()) return false; // We don't want to set the status on a folder
    if (!path.includes(this.getPath())) return false;
    // /home/ubuntu/inc/scanner.c
    for (const child of this.children) if (child.setStatus(path, status)) break;


    this.status = this.statusLogic();
    this.setStatusOnClassnameAs(this.status);

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

  public attachResults(component: any, path: string): boolean {
    if (!path.includes(this.getPath())) return false;

    // Avoid duplicate components
    const existComponent = this.components.some((el) => el.purl === component.purl && el.version === component.version);
    if (!existComponent) this.components.push(component);

    for (const child of this.children)
      if (child.attachResults(component, path)) break;

    this.original = NodeStatus.MATCH;
    this.status = this.statusLogic();

    // Que tenemos que hacer?
    // Actualizar el className del folder (de mi mismo) en funcion del estado de los hijos
    this.setStatusOnClassnameAs(this.status);

    return true;
  }

  public restoreStatus(path: string): void {
    if (!path.includes(this.getPath())) return;
    for (const child of this.children) if (child.restoreStatus(path)) break;
    this.status = this.getStatus(path);
    this.setStatusOnClassnameAs(this.status);
  }


  public getComponent(): any[] {
    return this.components;
  }
}
