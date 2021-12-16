
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

  protected className: string;

  protected status: NodeStatus;

  protected value: string; // Relative path to the folder or file

  private label: string;

  protected components: any[] = [];

  private include: boolean;

  protected action: string;

  private showCheckbox: boolean;

  protected original: NodeStatus;

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

  public abstract setStatus(path: string, status: NodeStatus): boolean;

  public abstract getStatusByPath(path: string): NodeStatus;

  public abstract setOriginal(status: NodeStatus): void;

  public abstract restoreStatus(path: string);

  public abstract attachResults(component: any, path: string): boolean;

  public abstract getComponent(): any[];

  public abstract getNode(path: string): Node;

  public abstract getFiltered(): Array<string>;

  public abstract getStatus(): NodeStatus;

  public abstract getFiles(): Array<any> ;

  
}
