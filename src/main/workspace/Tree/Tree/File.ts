import Node, { NodeStatus } from './Node';

export default class File extends Node {
  private isDependencyFile: boolean;

  constructor(name: string, path: string) {
    super(name, path);
    this.type = 'file';
    this.isDependencyFile = false;
  }

  public setStatus(path: string, status: NodeStatus): boolean {
    if (this.getPath() === path) {
      this.status = status;
      this.setStatusOnClassnameAs(status);
      return true;
    }
    return false;
  }

  public getStatusByPath(path: string): NodeStatus {
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

      this.setClassName('match-info-results status-pending');
      this.original = NodeStatus.MATCH;
      this.status = NodeStatus.PENDING;

      return true;
    }
    return false;
  }

  public restoreStatus(path: string) {
    if (this.getPath() !== path) return;
    if (this.getAction() === 'filter') {
      this.status = NodeStatus.FILTERED;
      this.setStatusOnClassnameAs(this.status);
      return;
    }

    if (this.original === NodeStatus.NOMATCH) {
      this.status = NodeStatus.NOMATCH;
      this.setStatusOnClassnameAs(this.status);
      return;
    }

    if (this.original === NodeStatus.MATCH) {
      this.status = NodeStatus.PENDING;
      this.setStatusOnClassnameAs(this.status);
    }
  }

  public getComponent(): any[] {
    return this.components;
  }

  public getFiltered(): Array<string> {
    const result: Array<string> = [];
    if (this.status === NodeStatus.FILTERED) {
      result.push(this.getPath());
    }
    return result;
  }

  public setOriginal(status: NodeStatus): void {
    this.original = status;
  }

  public getStatus(): NodeStatus {
    return this.status;
  }

  public getFiles(): Array<any> {
    let type = '';
    if (this.status === NodeStatus.PENDING) type = NodeStatus.MATCH;
    if (this.status === NodeStatus.FILTERED) type = NodeStatus.FILTERED;
    if (this.status === NodeStatus.NOMATCH) type = NodeStatus.NOMATCH;
    return [
      {
        path: this.getPath(),
        type,
      },
    ];
  }

  public summarize(root: string, summary: any): any {
    summary.total += 1;
    if (this.getAction() === 'filter') {
      summary.filter += 1;
      this.setClassName('filter-item');
    } else if (this.getInclude() === true) {
      summary.include += 1;
      // TODO: Change summary files to pass directly to scanner
      summary.files[`${root}${this.getPath()}`] = this.getScanMode();
    } else {
      this.setClassName('exclude-item');
    }
    return summary;
  }

  public getChildrenCount(): number {
    return 0;
  }

  public getChild(): Node {
    return null;
  }

  public addDependency(path: string): void {
    if (this.getPath() === path) this.isDependencyFile = true;
  }

  public filter(paths: Record<string, number>): boolean {
    if (!paths[this.getPath()] && this.getAction() !== 'filter') {
      this.status = NodeStatus.NOMATCH;
      this.setStatusOnClassnameAs(this.status);
      this.setFilteredMatch(false);
      return false;
    }
    this.setFilteredMatch(true);
    return true;
  }

  public getClone(): Node {
    return Object.assign(Object.create(File.prototype), this);
  }

  public getClonePath(paths: Record<string, number>): Node {
    if (paths[this.getPath()]) {
      const copy = Object.assign(Object.create(File.prototype), this);
      return copy;
    }
    return null;
  }
}
