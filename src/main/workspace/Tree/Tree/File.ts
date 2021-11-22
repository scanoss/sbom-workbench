import Node, { NodeStatus } from './Node';

export default class File extends Node {
  constructor(name: string, path: string) {
    super(name, path);
    this.type = 'file';
  }

  public setStatus(path: string, status: NodeStatus): boolean {
    if (this.getPath() === path) {
      this.status = status;
      this.setStatusOnClassnameAs(status);
      return true;
    }
    return false;
  }

  public getStatus(path: string): NodeStatus {
    if (path === this.getPath()) return this.status;
    return null;
  }

  public updateClassName(path: string, className: string): boolean {
    return true;
  }

  public getNode(path: string): Node {
    if (path === this.getPath()) return this;
    return null;
  }

  public attachResults(component: any, path: string): boolean {
    if (this.getPath() === path) {
      this.components.push(component);
      this.className = 'match-info-results status-pending';

      this.original = NodeStatus.MATCH;
      this.status = NodeStatus.PENDING;

      return true;
    }
    return false;
  }

  public restoreStatus(path: string) {
    if(this.getPath() === path) {

      // ver la logica con el original y el action.
      if (this.action === NodeStatus.FILTERED) {
        this.status = NodeStatus.FILTERED;
        return;
      }

      if (this.original === NodeStatus.NOMATCH) {
        this.status = NodeStatus.NOMATCH;
        return;
      }

      if (this.original === NodeStatus.MATCH) {
        this.status = NodeStatus.PENDING;
      }
    }
  }

  public getComponent(): any[] {
    return this.components;
  }
}
