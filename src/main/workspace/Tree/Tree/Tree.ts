import { isBinaryFileSync } from 'isbinaryfile';
import Node, { NodeStatus } from './Node';
import File from './File';
import Folder from './Folder';
import { IpcEvents } from '../../../../ipc-events';
import * as Filtering from '../../filtering';



const fs = require('fs');
const pathLib = require('path');

export class Tree {
  private rootFolder: Folder;

  private rootName: string;

  private rootPath: string;

  private msgToUI!: Electron.WebContents;

  private filesIndexed = 0;

  constructor(path: string) {
    const pathParts = path.split(pathLib.sep);
    this.rootName = pathParts[pathParts.length - 1];
    this.rootPath = path;
    this.rootFolder = new Folder('', this.rootName);
  }

  setMailbox(mailbox: Electron.WebContents) {
    this.msgToUI = mailbox;
  }

  sendToUI(eventName, data: any) {
    if (this.msgToUI) this.msgToUI.send(eventName, data);
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

  public summarize(root: string, summary: any): any {
    return this.rootFolder.summarize(root, summary);
  }

  private scanMode(filePath: string) {
    // eslint-disable-next-line prettier/prettier
    const skipExtentions = new Set ([".exe", ".zip", ".tar", ".tgz", ".gz", ".rar", ".jar", ".war", ".ear", ".class", ".pyc", ".o", ".a", ".so", ".obj", ".dll", ".lib", ".out", ".app", ".doc", ".docx", ".xls", ".xlsx", ".ppt" ]);
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

  public applyFilters(scanRoot: string, node: Node, bannedList: Filtering.BannedList) {
    let i = 0;
    if (node.getType() === 'file') {
      this.filesIndexed += 1;
      if (this.filesIndexed % 100 === 0)
        this.sendToUI(IpcEvents.SCANNER_UPDATE_STATUS, {
          stage: `indexing`,
          processed: this.filesIndexed,
        });
      if (bannedList.evaluate(scanRoot + node.getValue())) {
        node.setAction('scan');
        node.setScanMode(this.scanMode(scanRoot + node.getValue()));
      } else {
        node.setAction('filter');
        node.setStatusFromFilter(NodeStatus.FILTERED);
        node.setClassName('filter-item');
      }
    } else if (node.getType() === 'folder') {
      if (bannedList.evaluate(scanRoot + node.getValue())) {
        node.setAction('scan');
        for (i = 0; i < node.getChildrenCount(); i += 1) this.applyFilters(scanRoot, node.getChild(i), bannedList);
      } else {
        node.setAction('filter');
        node.setStatusFromFilter( NodeStatus.FILTERED);
        node.setClassName('filter-item');
      }
    }
  }
}
