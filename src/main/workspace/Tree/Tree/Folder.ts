import Node, { NodeStatus } from './Node';

export default class Folder extends Node {
  private children: Node[];

  hasPending: boolean;

  hasIgnored: boolean;

  hasIdentified: boolean;

  hasNoMatch: boolean;

  hasFiltered: boolean;

  constructor(path: string, label: string) {
    super(path, label);
    this.children = [];
    this.type = 'folder';
    this.hasPending = false;
    this.hasIdentified = false;
    this.hasIgnored = false;
    this.hasNoMatch = false;
    this.hasFiltered = false;
  }

  public addChild(node: Node): void {
    this.children.push(node);
  }

  public getChildren(): Node[] {
    return this.children;
  }

  public getStatusByPath(path: string): NodeStatus {
    if (!this.checkMyPath(path)) return null;
    return this.statusLogic();
  }

  public getStatus(): NodeStatus {
    return this.statusLogic();
  }

  private statusLogic(): NodeStatus {
    if (this.children.some((child) => child.getStatus() === NodeStatus.PENDING)) return NodeStatus.PENDING;
    if (this.children.some((child) => child.getStatus() === NodeStatus.IDENTIFIED)) return NodeStatus.IDENTIFIED;
    if (this.children.some((child) => child.getStatus() === NodeStatus.IGNORED)) return NodeStatus.IGNORED;
    if (this.children.some((child) => child.getStatus() === NodeStatus.NOMATCH)) return NodeStatus.NOMATCH;
    return NodeStatus.FILTERED;
  }

  private getStatusClassName(): NodeStatus {
    if (this.hasPending) return NodeStatus.PENDING;
    if (this.hasIdentified) return NodeStatus.IDENTIFIED;
    if (this.hasIgnored) return NodeStatus.IGNORED;
    if (this.hasNoMatch) return NodeStatus.NOMATCH;
    return NodeStatus.FILTERED;
  }

  private updateStatusFlags(): void {
    this.hasPending = false;
    this.hasIdentified = false;
    this.hasIgnored = false;
    this.hasNoMatch = false;
    this.hasFiltered = false;

    for (const child of this.children) {
      if (child.getType() === 'folder') {
        this.hasPending = child.hasPending || this.hasPending;
        this.hasIdentified = child.hasIdentified || this.hasIdentified;
        this.hasIgnored = child.hasIgnored || this.hasIgnored;
        this.hasNoMatch = child.hasNoMatch || this.hasNoMatch;
        this.hasFiltered = child.hasFiltered || this.hasFiltered;
      } else {
        if (child.status === NodeStatus.PENDING) this.hasPending = true;
        if (child.status === NodeStatus.IDENTIFIED) this.hasIdentified = true;
        if (child.status === NodeStatus.IGNORED) this.hasIgnored = true;
        if (child.status === NodeStatus.NOMATCH) this.hasNoMatch = true;
        if (child.status === NodeStatus.FILTERED) this.hasFiltered = true;
        if (this.hasPending && this.hasIdentified && this.hasIgnored && this.hasNoMatch && this.hasFiltered) break;
      }
    }
  }

  public setStatus(path: string, status: NodeStatus): boolean {
    if (path === this.getPath()) return false;
    if (!this.checkMyPath(path)) return false;
    for (const child of this.children) if (child.setStatus(path, status)) break;
    this.updateStatusFlags();
    this.status = this.getStatusClassName();
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

    this.updateStatusFlags();
    this.status = this.getStatusClassName();

    this.setStatusOnClassnameAs(this.status);
    return true;
  }

  public restoreStatus(path: string): void {
    if (!path.includes(this.getPath())) return;
    for (const child of this.children) if (child.restoreStatus(path)) break;

    this.updateStatusFlags();
    this.status = this.getStatusClassName();

    this.setStatusOnClassnameAs(this.status);
  }

  // Returns true only if my path is contained in the path (parameter)
  private checkMyPath(path: string): boolean {
    if (!path.includes(this.getPath())) return false;
    // Only if first filter is passed.
    const myPathExploded = this.getPath().split('/');
    const pathExploded = path.split('/');
    for (let i = 0; i < myPathExploded.length; i += 1) {
      if (myPathExploded[i] !== pathExploded[i]) return false;
    }
    return true;
  }

  public getComponent(): any[] {
    return this.components;
  }

  public getFiltered(): Array<string> {
    const result: Array<string> = [];
    this.children.forEach((child) => {
      result.push(...child.getFiltered());
    });
    return result;
  }

  public setOriginal(status: NodeStatus): void {
    this.original = status;
  }

  // Used only for migration
  public updateAllStatusFlags() {
    for (const child of this.children)
      if (child.type === 'folder') {
        child.updateAllStatusFlags();
        this.updateStatusFlags();
        this.status = this.getStatusClassName();
        this.setStatusOnClassnameAs(this.status);
      }
  }

  public getFiles(): Array<any> {
    const files: Array<any> = [];
    this.children.forEach((child) => {
      files.push(...child.getFiles());
    });
    return files;
  }

  public summarize(root: string, summary: any): any {
    if (this.getAction() === 'filter') {
      this.setClassName('filter-item');
    } else {
      this.children.forEach((child) => {
        const aux = child.summarize(root, summary);
        summary.total = aux.total;
        summary.include = aux.include;
        summary.filter = aux.filter;
        summary.files = aux.files;
      });
    }

    return summary;
  }

  public getChildrenCount(): number {
    return this.children.length;
  }

  public getChild(i: number): Node {
    return this.children[i];
  }

  public filter(paths: Array<string>): void {
    this.children.forEach((child) => {
      child.filter(paths);
    });
    this.updateStatusFlags();
    this.status = this.getStatusClassName();

    this.setStatusOnClassnameAs(this.status);
  }

  public getCopy(): Node {
    const copy = new Folder(this.getPath(), this.getLabel());
    copy.children = this.children.map((child) => child.getCopy());
    copy.original = this.original;
    copy.status = this.status;
    copy.components = this.components;
    copy.type = this.type;
    copy.hasPending = this.hasPending;
    copy.hasIdentified = this.hasIdentified;
    copy.hasIgnored = this.hasIgnored;
    copy.hasNoMatch = this.hasNoMatch;
    copy.hasFiltered = this.hasFiltered;
    return copy;
  }
}
