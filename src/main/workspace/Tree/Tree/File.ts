import Node from './Node';

export default class File extends Node {
  private component: string[] = [];

  public updateStatus(path: string, status: string): boolean {
    return true;
  }
  
  public addComponent(component: string, path: string): void {
    console.log(this.getName());
  
    if (this.getName() === path) {
 
      this.component.push(component);
    }
  }
}
