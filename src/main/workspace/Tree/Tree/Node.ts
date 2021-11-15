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

  private showCheckbox: boolean;

  constructor(path: string, label: string) {
    this.value = path;
    this.label = label;
    this.include = true;
    this.className = 'no-match status-pending';
    this.showCheckbox = false;
    this.action = 'filter';  // filter or scan
    this.status = 'pending'; // pending, identified, ignored
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

  public setStatusOnClassnameAs(className: string): void {
    const re = new RegExp('.status-.*');
    this.className = this.className.replace(re, '');
    this.className += ` status-${className}`;
  }

  public abstract updateStatus(path: string, status: string): boolean;

  public abstract updateClassName(path: string, status: string): boolean;

  public abstract addComponent(component: any, path: string): boolean;

  public abstract getComponent(): any[];

  public abstract getNode(path: string): Node;
}
