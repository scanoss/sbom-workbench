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

  public getStatus(path: string): NodeStatus {
    if (!this.checkMyPath(path)) return null;
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
    if (path === this.getPath()) return false;
    if (!this.checkMyPath(path)) return false;
    for (const child of this.children) if (child.setStatus(path, status)) break;
    this.status = this.statusLogic();
    this.setStatusOnClassnameAs(this.status);
    return true;
  }

  public updateClassName(path: string, status: string): boolean {
    throw new Error('Method not implemented.');
  }

  public getNode(path: string): Node {
    if (!this.checkMyPath(path)) return null;
    if (path === this.getPath()) return this;
    for (const child of this.children) {
      const node = child.getNode(path);
      if (node !== null) return node;
    }
    return null;
  }

  public attachResults(component: any, path: string): boolean {
    if (!this.checkMyPath(path)) return false;
    // Avoid duplicate components
    const existComponent = this.components.some((el) => el.purl === component.purl && el.version === component.version);
    if (!existComponent) this.components.push(component);
    for (const child of this.children) if (child.attachResults(component, path)) break;
    this.original = NodeStatus.MATCH;
    this.status = this.statusLogic();
    this.setStatusOnClassnameAs(this.status);
    return true;
  }

  public restoreStatus(path: string): void {
    if (!path.includes(this.getPath())) return;
    for (const child of this.children) if (child.restoreStatus(path)) break;
    this.status = this.getStatus(path);
    this.setStatusOnClassnameAs(this.status);
  }

  // Returns true only if my path is contained in the path (parameter)
  private checkMyPath(path: string): boolean {
    if (!path.includes(this.getPath())) return false;
    // Only if first filter is passed.
    const myPathExploded = this.getPath().split('/');
    const pathExploded = path.split('/');
    for(let i=0;i<myPathExploded.length;i+=1) {
      if (myPathExploded[i] !== pathExploded[i]) return false;
    }
    return true;
  }

  public getComponent(): any[] {
    return this.components;
  }

}
