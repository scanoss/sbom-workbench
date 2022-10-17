import { isBinaryFileSync } from 'isbinaryfile';
import { IDependencyResponse } from 'scanoss';
import log from 'electron-log';
import Node, { NodeStatus } from './Node';
import File from './File';
import Folder from './Folder';

import { broadcastManager } from '../../broadcastManager/BroadcastManager';
import { IpcChannels } from '../../../api/ipc-channels';
import * as Filtering from '../filtering';
import { TreeViewMode } from './treeViewModes/TreeViewMode';
import { TreeViewDefault } from './treeViewModes/TreeViewDefault';
import { defaultBannedList } from '../filtering/defaultFilter';

const fs = require('fs');
const pathLib = require('path');

export class Tree {
  private rootFolder: Folder;

  private rootName: string;

  private rootPath: string;

  private projectPath: string;

  private filesIndexed = 0;

  private fileTreeViewMode: TreeViewMode;

  private summary;

  constructor(path: string, projectPath: string) {
    const pathParts = path.split(pathLib.sep);
    this.rootName = pathParts[pathParts.length - 1];
    this.rootPath = path;
    this.rootFolder = new Folder('', this.rootName);
    this.fileTreeViewMode = new TreeViewDefault();
    this.summary = {};
    this.projectPath = projectPath;
  }

  sendToUI(eventName, data: any) {
    broadcastManager.get().send(eventName, data);
  }

  public build(): Node {
    this.buildTreeRec(this.rootPath, this.rootFolder, this.rootPath);
    return this.rootFolder;
  }

  public buildTreeRec(path: string, root: Folder, rootPath: string): Node {
    const dirEntries = fs
      .readdirSync(path, { withFileTypes: true }) // Returns a list of files and folders
      .sort(this.dirFirstFileAfter)
      .filter((dirent: any) => !dirent.isSymbolicLink());
    for (const dirEntry of dirEntries) {
      const relativePath = `${path}/${dirEntry.name}`.replace(rootPath, '');
      if (dirEntry.isDirectory()) {
        const f: Folder = new Folder(relativePath, dirEntry.name);
        const subTree = this.buildTreeRec(
          `${path}/${dirEntry.name}`,
          f,
          rootPath
        );
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
          this.rootFolder.attachResults(
            { purl: value[i].purl[0], version: value[i].version },
            key
          );
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
    return Object.assign(Object.create(Folder.prototype), {
      ...data,
      children,
    });
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

  public summarize(): any {
    const summary = { total: 0, include: 0, filter: 0, files: {} };
    const sum = this.rootFolder.summarize(this.rootPath, summary);
    this.summary = sum;
    return sum;
  }

  public getSummarize(): any {
    return this.summary;
  }

  private scanMode(filePath: string) {
    // eslint-disable-next-line prettier/prettier
    const skipExtentions = new Set([
      '.exe',
      '.zip',
      '.tar',
      '.tgz',
      '.gz',
      '.rar',
      '.jar',
      '.war',
      '.ear',
      '.class',
      '.pyc',
      '.o',
      '.a',
      '.so',
      '.obj',
      '.dll',
      '.lib',
      '.out',
      '.app',
      '.doc',
      '.docx',
      '.xls',
      '.xlsx',
      '.ppt',
    ]);
    const skipStartWith = ['{', '[', '<?xml', '<html', '<ac3d', '<!doc'];
    const MIN_FILE_SIZE = 256;

    // Filter by extension
    const ext = pathLib.extname(filePath);
    if (skipExtentions.has(ext)) {
      return 'MD5_SCAN';
    }
    // Filter by min size
    const fileSize = fs.statSync(filePath).size;
    if (fileSize < MIN_FILE_SIZE) {
      return 'MD5_SCAN';
    }
    // if start with pattern
    const file = fs.readFileSync(filePath, 'utf8');
    for (const skip of skipStartWith) {
      if (file.startsWith(skip)) {
        return 'MD5_SCAN';
      }
    }
    // if binary
    if (isBinaryFileSync(filePath)) {
      return 'MD5_SCAN';
    }

    return 'FULL_SCAN';
  }

  public setFilter() {
    const bannedList = new Filtering.BannedList('NoFilter');
    if (!fs.existsSync(`${this.projectPath}/filter.json`))
      fs.writeFileSync(
        `${this.projectPath}/filter.json`,
        JSON.stringify(defaultBannedList).toString()
      );
    bannedList.load(`${this.projectPath}/filter.json`);

    log.info(`%c[ PROJECT ]: Building tree`, 'color: green');
    log.info(`%c[ PROJECT ]: Applying filters to the tree`, 'color: green');
    this.applyFilters(this.rootPath, this.getRootFolder(), bannedList);
  }

  public applyFilters(
    scanRoot: string,
    node: Node,
    bannedList: Filtering.BannedList
  ) {
    let i = 0;
    if (node.getType() === 'file') {
      this.filesIndexed += 1;
      if (this.filesIndexed % 100 === 0) {
        this.sendToUI(IpcChannels.SCANNER_UPDATE_STATUS, {
          processed: this.filesIndexed,
        });
      }
      if (bannedList.evaluate(scanRoot + node.getValue())) {
        node.setAction('scan');
        node.setScanMode(this.scanMode(scanRoot + node.getValue()));
      } else {
        node.setAction('filter');
        node.setStatusDeep(NodeStatus.FILTERED);
        node.setClassName('filter-item');
      }
    } else if (node.getType() === 'folder') {
      if (bannedList.evaluate(scanRoot + node.getValue())) {
        node.setAction('scan');
        for (i = 0; i < node.getChildrenCount(); i += 1)
          this.applyFilters(scanRoot, node.getChild(i), bannedList);
      } else {
        node.setAction('filter');
        node.setClassNameDeep('filter-item');
        node.setActionDeep('filter');
        node.setStatusDeep(NodeStatus.FILTERED);
      }
    }
  }

  public addDependencies(dependencies: IDependencyResponse): void {
    dependencies.filesList.forEach((dependency) => {
      this.getRootFolder().addDependency(dependency.file);
    });
  }

  public setTreeViewMode(mode: TreeViewMode) {
    this.fileTreeViewMode = mode;
  }

  public async getTree(): Promise<Node> {
    const tree = await this.fileTreeViewMode.getTree(this.getRootFolder());
    return tree;
  }

  public getRootPath(): string {
    return this.rootPath;
  }
}
