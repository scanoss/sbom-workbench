import Node, {NodeStatus} from './Node';


export default class Folder extends Node {
  private children: Node[];

  hasPending: boolean;

  hasIgnored: boolean;

  hasIdentified: boolean;

  hasNoMatch: boolean;

  hasFiltered: boolean;

  private hasIdentifiedProgress: boolean;

  private hasPendingProgress: boolean;

  private hasIgnoredProgress: boolean;

  constructor(path: string, label: string) {
    super(path, label);
    this.children = [];
    this.type = 'folder';
    this.hasPending = false;
    this.hasIdentified = false;
    this.hasIgnored = false;
    this.hasNoMatch = false;
    this.hasFiltered = false;
    this.hasIdentifiedProgress = false;
    this.hasPendingProgress = false;
    this.hasIgnoredProgress = false;
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
    return this.getStatusClassName();

  }

  private statusLogic(): NodeStatus {
    if (this.children.some((child) => child.getStatus() === NodeStatus.PENDING)) return NodeStatus.PENDING;
    if (this.children.some((child) => child.getStatus() === NodeStatus.IDENTIFIED)) return NodeStatus.IDENTIFIED;
    if (this.children.some((child) => child.getStatus() === NodeStatus.IGNORED)) return NodeStatus.IGNORED;
    if (this.children.some((child) => child.getStatus() === NodeStatus.NOMATCH)) return NodeStatus.NOMATCH;
    return NodeStatus.FILTERED;
  }

  public getStatusClassName(): NodeStatus {
    if (this.hasPending) return NodeStatus.PENDING;
    if (this.hasIdentified) return NodeStatus.IDENTIFIED;
    if (this.hasIgnored) return NodeStatus.IGNORED;
    if (this.hasNoMatch) return NodeStatus.NOMATCH;
    return NodeStatus.FILTERED;
  }



  public updateStatusFlags(): void {
    this.hasPending = false;
    this.hasIdentified = false;
    this.hasIgnored = false;
    this.hasNoMatch = false;
    this.hasFiltered = false;

    this.hasIdentifiedProgress = false;
    this.hasPendingProgress = false;
    this.hasIgnoredProgress = false;

    for (const child of this.children) {
      const status = child.getStatus();
      if (status === NodeStatus.PENDING) this.hasPending = true;
      if (status === NodeStatus.IDENTIFIED) this.hasIdentified = true;
      if (status === NodeStatus.IGNORED) this.hasIgnored = true;
      if (status === NodeStatus.NOMATCH) this.hasNoMatch = true;
      if (status === NodeStatus.FILTERED) this.hasFiltered = true;
      if (status === NodeStatus.IDENTIFIED && !child.isDependency()) this.hasIdentifiedProgress = true;
      if (status === NodeStatus.PENDING && !child.isDependency()) this.hasPendingProgress = true;
      if (status === NodeStatus.IGNORED && !child.isDependency()) this.hasIgnoredProgress = true;
      if (this.hasPending && this.hasIdentified && this.hasIgnored && this.hasNoMatch && this.hasFiltered &&  this.hasIdentifiedProgress && this.hasPendingProgress && this.hasIgnoredProgress ) break;
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

  public getFiles(filter?: Record<string, any>): Array<any> {
    const files: Array<any> = [];
    if(filter && filter.skipIgnoredFolders){
      if(this.status === NodeStatus.FILTERED) return files;
    }
    this.children.forEach((child) => {
      files.push(...child.getFiles(filter));
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

  public addDependency(path: string): void {
    if (!this.checkMyPath(path)) return;
    for (const child of this.children) {
      child.addDependency(path);
    }
  }

  public filter(paths: Record<string, number>): boolean {
    this.setFilteredMatch(false);
    this.children.forEach((child) => {
      if (child.filter(paths) === true) this.setFilteredMatch(true);
    });
    this.updateStatusFlags();
    this.status = this.getStatusClassName();
    this.setStatusOnClassnameAs(this.status);
    return this.getFilteredMatch();
  }

  public getClone(): Node {
    const copy = Object.assign(Object.create(Folder.prototype), this);
    copy.children = this.children.map((child) => child.getClone());
    return copy;
  }

  public getClonePath(paths: Record<string, number>): Node {
    const childrenClone = this.children.map((child) => child.getClonePath(paths)).filter((child) => child !== null);
    if (childrenClone.length === 0) return null;
    const copy = Object.assign(Object.create(Folder.prototype), this);
    copy.children = childrenClone;
    copy.updateStatusFlags();
    copy.status = copy.getStatusClassName();
    copy.setStatusOnClassnameAs(copy.status);
    return copy;
  }

  public setClassNameDeep(className: string): void {
    this.setClassName(className);
    this.getChildren().forEach((node) => node.setClassNameDeep(className));
  }

  public setActionDeep(action: string): void {
    this.setAction(action);
    this.getChildren().forEach((node) => node.setActionDeep(action));
  }

  public setStatusDeep(status: NodeStatus): void {
    this.status = status;
    this.getChildren().forEach((node) => node.setStatusDeep(status));
  }

  public isDependency(): boolean {
    return false;
  }

  public containsFile(filename: string): boolean {
    for (const child of this.getChildren()) {
      if(child.getName() === filename) return true;
    }
    return false;
  }

}
