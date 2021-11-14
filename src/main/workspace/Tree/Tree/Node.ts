const pathLib = require('path');

export default abstract class Node {
  // private type: string;
  // private className: string;
  private value: string; // Relative path to the folder or file

  private label: string;

  protected components: any[] = [];
  // private inventories: any;
  // private components: any;
  // private include: any;
  // private action: string;
  // private showCheckbox: string;

  // value: filename.replace(root, ''),
  // label: path.basename(filename),

  constructor(path: string, label: string) {
    this.value = path;
    this.label = label;
  }

  public getName(): string {
    return this.label;
  }

  public getPath(): string {
    return this.value;
  }

  public abstract updateStatus(path: string, status: string): boolean;

  public abstract addComponent(component: any, path: string): boolean;

  public abstract getComponent(): any[];
  // public abstract addChild(node :Node): void;
}




