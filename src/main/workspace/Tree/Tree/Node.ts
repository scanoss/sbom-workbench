const pathLib = require('path');

export default abstract class Node {
  protected type: string;

  protected className: string;

  protected status: string;

  protected value: string;  // Relative path to the folder or file

  private label: string;

  protected components: any[] = [];

  private include: boolean;

  private action: string;

  private showCheckbox: string;



  constructor(path: string, label: string) {
    this.value = path;
    this.label = label;
    this.include = true;
    this.className = 'no-match';
    this.action = 'filter';
    this.showCheckbox = 'false';
    this.status = 'pending';
  }

  public getName(): string {
    return this.label;
  }

  public getStatus(): string {
    return this.status;
  }

  public getPath(): string {
    return this.value;
  }

  public abstract updateStatus(path: string, status: string): boolean;

  public abstract updateClassName(path: string, status: string): boolean;

  public abstract addComponent(component: any, path: string): boolean;

  public abstract getComponent(): any[];

  public abstract getNode(path: string): Node;
}
