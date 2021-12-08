import Node, { NodeStatus } from './Node';
import File from './File';
import Folder from './Folder';

const fs = require('fs');
const pathLib = require('path');

export class Tree {
  private rootFolder: Folder;

  private rootName: string;

  private rootPath: string;

  constructor(path: string) {
    const pathParts = path.split(pathLib.sep);
    this.rootName = pathParts[pathParts.length - 1];
    this.rootPath = path;
    this.rootFolder = new Folder('', this.rootName);
  }

  public buildTree(): Node {
    this.buildTreeRec(this.rootPath, this.rootFolder);
    return this.rootFolder;
  }

  private buildTreeRec(path: string, root: Folder): Node {
    const dirEntries = fs
      .readdirSync(path, { withFileTypes: true }) // Returns a list of files and folders
      .sort(this.dirFirstFileAfter)
      .filter((dirent: any) => !dirent.isSymbolicLink());

    for (const dirEntry of dirEntries) {
      const relativePath = `${path}/${dirEntry.name}`.replace(this.rootPath, '');
      if (dirEntry.isDirectory()) {
        const f: Folder = new Folder(relativePath, dirEntry.name);
        const subTree = this.buildTreeRec(`${path}/${dirEntry.name}`, f);
        root.addChild(subTree);
      } else root.addChild(new File(relativePath, dirEntry.name));
    }
    return root;
  }

  // This is a sorter that will sort folders before files in alphabetical order.
  private dirFirstFileAfter(a: any, b: any) {
    if (!a.isDirectory() && b.isDirectory()) return 1;
    if (a.isDirectory() && !b.isDirectory()) return -1;
    return 0;
  }

  public attachResults(results: any): void {
    Object.entries(results).forEach(([key, value]: [string, any]) => {
      for (let i = 0; i < value.length; i += 1) {
        if (value[i].purl !== undefined) {
          this.rootFolder.attachResults({ purl: value[i].purl[0], version: value[i].version }, key);
        }
      }
    });
  }

  public restoreStatus(paths: Array<string>) {
    for (const path of paths) this.rootFolder.restoreStatus(path);
  }

  public loadTree(data: any): void {
    this.rootFolder = this.deserialize(data) as Folder;
  }

  private deserialize(data: any): Node {
    if (data.type === 'file') {
      return Object.assign(Object.create(File.prototype), data);
    }
    const children = data.children.map((child: any) => this.deserialize(child));
    return Object.assign(Object.create(Folder.prototype), { ...data, children });
  }

  public getRootFolder(): Folder {
    return this.rootFolder;
  }

  public getNode(path: string) {
    return this.rootFolder.getNode(path);
  }

  public sync(filesStatus: Array<Record<string, NodeStatus>>) {
    for (const file of filesStatus) {
      this.rootFolder.setStatus(file.path, file.status);
      this.getNode(file.path).setOriginal(file.original);
    }
  }

  public getFilteredFiles(): Array<string> {
    return this.rootFolder.getFiltered();
  }
}
