import { BlackListAbstract } from './blackList/BlackListAbstract';
import { Visitor } from './visitor/Visitor';

export enum NodeStatus {
  FILTERED = 'FILTERED',
  NOMATCH = 'NO-MATCH',
  MATCH = 'MATCH',
  PENDING = 'PENDING',
  IDENTIFIED = 'IDENTIFIED',
  IGNORED = 'IGNORED',
}

export default abstract class Node {
  protected type: string;

  private className: string;

  protected status: NodeStatus;

  private value: string; // Relative path to the folder or file

  private label: string;

  protected components: any[] = [];

  private include: boolean;

  private action: string;

  private showCheckbox: boolean;

  protected original: NodeStatus;

  private scanMode: string;

  private isFilteredMatch: boolean;

  protected isBinaryFile: boolean;

  constructor(path: string, label: string) {
    this.value = path;
    this.label = label;

    this.status = NodeStatus.NOMATCH;
    this.original = NodeStatus.NOMATCH;

    // Those parameters are used by the UI.
    this.className = 'no-match';
    this.showCheckbox = false;

    this.include = true;
  }

  public getName(): string {
    return this.label;
  }

  public getPath(): string {
    return this.value;
  }

  public getLabel(): string {
    return this.label;
  }

  public setStatusOnClassnameAs(className: string): void {
    const re = new RegExp('.status-.*');
    this.className = this.className.replace(re, '');

    if (className === NodeStatus.IDENTIFIED || className === NodeStatus.IGNORED || className === NodeStatus.PENDING) {
      this.className = ` status-${className.toLowerCase()}`;
    }

    if (className === NodeStatus.FILTERED) {
      this.className = 'filter-item';
    }

    if (className === NodeStatus.NOMATCH) {
      this.className = 'no-match';
    }
  }

  public getInclude(): boolean {
    return this.include;
  }

  public setScanMode(scanMode: string): void {
    this.scanMode = scanMode;
  }

  public getScanMode(): string {
    return this.scanMode;
  }

  public setValue(value: string): void {
    this.value = value;
  }

  public getValue(): string {
    return this.value;
  }

  public setAction(action: string): void {
    this.action = action;
  }

  public getAction(): string {
    return this.action;
  }

  public setClassName(className: string): void {
    this.className = className;
  }

  public getClassName(): string {
    return this.className;
  }

  public getType(): string {
    return this.type;
  }

  public abstract setStatusDeep(status: NodeStatus): void;

  public setFilteredMatch(isFilteredMatch: boolean): void {
    this.isFilteredMatch = isFilteredMatch;
  }

  public getFilteredMatch(): boolean {
    return this.isFilteredMatch;
  }

  public setIsBinaryFile(isBinaryFile: boolean):void {
    this.isBinaryFile = isBinaryFile;
  }

  public getIsBinaryFile():boolean {
    return this.isBinaryFile;
  }

  public abstract getChild(i: number): Node;

  public abstract getChildrenCount(): number;

  public abstract setStatus(path: string, status: NodeStatus): boolean;

  public abstract updateStatusFlags(): void;

  public abstract updateFlags(): void;

  public abstract getStatusByPath(path: string): NodeStatus;

  public abstract setOriginal(status: NodeStatus): void;

  public abstract restoreStatus(path: string);

  public abstract attachResults(component: any, path: string): boolean;

  public abstract getComponent(): any[];

  public abstract getNode(path: string): Node;

  public abstract getFiltered(): Array<string>;

  public abstract getStatus(): NodeStatus;

  public abstract getFiles(banned: BlackListAbstract): Array<any>;

  public abstract summarize(root: string, summary: any): any;

  public abstract addDependency(path: string): void;

  public abstract filter(paths: Record<string, number>): boolean;

  public abstract getClone(): Node;

  public abstract getClonePath(paths: Record<string, number>): Node;

  public abstract setClassNameDeep(className: string): void;

  public abstract setActionDeep(action: string): void;

  public abstract isDependency(): boolean;

  public abstract order(): void;

  public abstract someFiltered(): boolean;

  public abstract someNoMatch(): boolean;

  public abstract someMatch(): boolean;

  public abstract identifiedProgress(): boolean;

  // Only looks for a specific filename one depth level. WARNING: It does not verify in subfolders!
  public abstract containsFile(filename: string): boolean;

  public abstract accept<T>(visitor: Visitor<T>): T;
}
