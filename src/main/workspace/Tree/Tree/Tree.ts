import Node from './Node';
import File from './File';
import Folder from './Folder';
import { EventEmitter } from 'events';

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
    this.rootFolder = new Folder(pathLib.sep, this.rootName);
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
}
