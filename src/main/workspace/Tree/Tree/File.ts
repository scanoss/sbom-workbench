import Node from './Node';

export default class File extends Node {
 // private component: string[] = [];

  public updateStatus(path: string, status: string): boolean {
    return true;
  }

  public addComponent(component: string, path: string): boolean {
    if (this.getPath() === path) {
        this.components.push(component);
        return true;
    }
    return false;
  }

  public getComponent(): any[] {
    return this.components;
  }
}
