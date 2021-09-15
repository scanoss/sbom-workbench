/* eslint-disable max-classes-per-file */
import { EventEmitter } from 'events';
import * as os from 'os';
import fs from 'fs';
import { ipcMain } from 'electron';
import { Inventory, Project } from '../../api/types';
import { app } from 'electron';
// import * as fs from 'fs';
// import * as Filtering from './filtering';
// import { eventNames } from 'process';
/* const aFilter=require('./salida')
 const blist =require('./salida') */
// import * as Emmiter from 'events';

import * as Filtering from './filtering';
import { ScanDb } from '../db/scan_db';
import { licenses } from '../db/licenses';
import { Scanner } from '../scannerLib/Scanner';
import { ScannerEvents } from '../scannerLib/ScannerEvents';
import { IpcEvents } from '../../ipc-events';
import { defaultBannedList } from './filtering/defaultFilter';
import { isBinaryFile, isBinaryFileSync } from 'isbinaryfile';

const path = require('path');

const cont = 0;

let defaultProject: ProjectTree;

export { defaultProject };



export class ProjectTree extends EventEmitter {
  work_root: string;

  scan_root: string;

  project_name: string;

  banned_list: Filtering.BannedList;

  logical_tree: any;

  results: any;

  scans_db!: ScanDb;

  scanner!: Scanner;

  msgToUI!: Electron.WebContents;

  filesSummary: any;

  processedFiles = 0;

  filesIndexed = 0;

  filesToScan: [];

  constructor(name: string) {
    super();
    this.work_root = '';
    this.scan_root = '';
    this.project_name = name;
    this.banned_list = new Filtering.BannedList('NoFilter');
    // forces a singleton instance, will be killed in a multiproject domain
    defaultProject = this;

  }

  set_scan_root(root: string) {
    this.scan_root = root;
  }

  set_project_name(name: string) {
    this.project_name = name;
  }

  set_work_root(root: string) {
    this.work_root = root;
  }

  getScanRoot(): string {
    return this.scan_root;
  }

  getWorkRoot(): string {
    return this.work_root;
  }

  build_tree() {
    this.logical_tree = dirTree(this.scan_root, this.scan_root);
    this.emit('treeBuilt', this.logical_tree);
  }

  async loadScanProject(rootOfProject: string) {
    const file = fs.readFileSync(`${rootOfProject}/tree.json`, 'utf8');
    const a = JSON.parse(file);
    this.logical_tree = a.logical_tree;
    this.work_root = a.work_root;
    this.results = a.results;
    this.scan_root = a.scan_root;
    this.project_name = a.project_name;
    this.filesSummary = a.filesSummary;
    this.scans_db = new ScanDb(rootOfProject);
    this.banned_list = new Filtering.BannedList('NoFilter');
    this.banned_list.load(`${this.work_root}/filter.json`);
    await this.scans_db.init();
    this.scanner = new Scanner();

  }



  saveScanProject() {
    const file = fs.writeFileSync(`${this.work_root}/tree.json`, JSON.stringify(this).toString());

    // Save metadata
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const metadata = {
      id: 'NULL',
      appVersion: app.getVersion(),
      name: self.scan_root.split('/').pop(), // Get the folder name
      work_root: self.work_root,
      scan_root: self.scan_root,
      files: self.filesSummary.include,
      date: new Date().toISOString(),
    };

    fs.writeFileSync(`${this.work_root}/metadata.json`, JSON.stringify(metadata).toString());
  }

  createScanProject(scanPath: string) {
    const p: Project = {
      work_root: `${getUserHome()}/scanoss-workspace/${path.basename(scanPath)}`,
      scan_root: scanPath,
      default_components: '',
      default_licenses: '',
    };
    this.set_work_root(p.work_root);
    this.set_scan_root(p.scan_root);
    this.set_project_name(`${path.basename(scanPath)}`);
    if (!fs.existsSync(`${getUserHome()}/scanoss-workspace`)) {
      fs.mkdirSync(`${getUserHome()}/scanoss-workspace/`);
    }
    if (!fs.existsSync(p.work_root)) {
      fs.mkdirSync(p.work_root);
    } else {
      //  this.msgToUI.send(IpcEvents.SCANNER_ERROR_STATUS, { reason: 'projectExists', severity: 'warning' });
      // this.cleanProject();
    }

    if (!fs.existsSync(`${this.work_root}/filter.json`)) {
      console.log('No banned list defined. Setting default list.');
       fs.writeFileSync(`${this.work_root}/filter.json`, JSON.stringify(defaultBannedList).toString());
    } else console.log('Filters were already defined');
    this.banned_list.load(`${this.work_root}/filter.json`);

    this.scans_db = new ScanDb(p.work_root);

    this.scanner = new Scanner();
    this.scanner.setWorkDirectory(p.work_root);

    this.setScannerListeners();
  }

  cleanProject() {
    console.log(`${this.work_root}/tree.json`);
    if (fs.existsSync(`${this.work_root}/results.json`)) fs.unlinkSync(`${this.work_root}/results.json`);
    if (fs.existsSync(`${this.work_root}/scan_db`)) fs.unlinkSync(`${this.work_root}/scan_db`);
    if (fs.existsSync(`${this.work_root}/tree.json`)) fs.unlinkSync(`${this.work_root}/tree.json`);
    this.scanner.cleanWorkDirectory();
  }

  // Return fileList
  setScannerListeners() {
    this.scanner.on(ScannerEvents.WINNOWING_STARTING, () => console.log('Starting Winnowing...'));
    this.scanner.on(ScannerEvents.WINNOWING_NEW_WFP_FILE, (dir) => console.log(`New WFP File on: ${dir}`));
    this.scanner.on(ScannerEvents.WINNOWING_FINISHED, () => console.log('Winnowing Finished...'));
    this.scanner.on(ScannerEvents.DISPATCHER_WFP_SENDED, (dir) => console.log(`Sending WFP file ${dir} to server`));

    this.scanner.on(ScannerEvents.DISPATCHER_NEW_DATA, async (data, dispatcherResponse) => {

      const filesScanned = dispatcherResponse.getFilesScanned();
      this.processedFiles += filesScanned.length;
      console.log(`New ${filesScanned.length} files scanned`);
      this.msgToUI.send(IpcEvents.SCANNER_UPDATE_STATUS, {
        stage: 'scanning',
        // processed: this.filesSummary.include,
        processed: (100 * this.processedFiles) / this.filesSummary.include,
      });

      this.attachComponent(data);
    });

    this.scanner.on(ScannerEvents.SCAN_DONE, async (resPath) => {
      console.log(`Scan Finished... Results on: ${resPath}`);

      const succesRes = await this.scans_db.results.insertFromFile(resPath);
      if (succesRes) await this.scans_db.components.importUniqueFromFile();

      const a = fs.readFileSync(`${resPath}`, 'utf8');
      this.results = JSON.parse(a);

      this.saveScanProject();

      this.msgToUI.send(IpcEvents.SCANNER_FINISH_SCAN, {
        success: true,
        resultsPath: this.work_root,
      });
    });

    this.scanner.on('error', (error) => {
      this.msgToUI.send(IpcEvents.SCANNER_ERROR_STATUS, error);
    });

    ipcMain.on(IpcEvents.SCANNER_RESUME, async (event, arg: IInitScan) => {
      this.resumeScanner();
    });

  }

  resumeScanner() {

    const timeout = 15; //En segs.
    let tickCounter = 0;

    const timerID = setInterval(() => {

      console.log(`Resuming scanner in ${timeout - tickCounter} secs...`);
      tickCounter += 1;

      if(tickCounter >= timeout) {
           this.scanner.resume();
           clearInterval(timerID);
      }

    this.msgToUI.send(IpcEvents.SCANNER_UPDATE_STATUS, {
      stage: 'resuming',
      // processed: this.filesSummary.include,
      processed: (100 * tickCounter) / timeout,
    });



    }, 1000);



  }

  startScan() {
    console.log(`SCANNER: Start scanning path=${this.scan_root}`);

    // eslint-disable-next-line prettier/prettier
    this.scanner.scanList(this.filesToScan, this.scan_root);
  }

  setMailbox(mailbox: Electron.WebContents) {
    this.msgToUI = mailbox;
  }

  stopScan() {}

  async prepare_scan() {
    let success;
    this.cleanProject();
    const created = await this.scans_db.init();
    if (created) {
      console.log('Inserting licenses...');
      success = await this.scans_db.licenses.importFromJSON(licenses);
    }

    this.msgToUI.send(IpcEvents.SCANNER_UPDATE_STATUS, {
      stage: 'preparing',
      processed: 30,
    });
    // const i = 0;
    this.build_tree();
    this.msgToUI.send(IpcEvents.SCANNER_UPDATE_STATUS, {
      stage: 'preparing',
      processed: 60,
    });
    // apply filters.
    // this.banned_list.loadDefault();
    // this.banned_list.save(`${this.work_root}/filter.json`);

    this.msgToUI.send(IpcEvents.SCANNER_UPDATE_STATUS, {
      stage: 'preparing',
      processed: 100,
    });

    this.indexScan(this.scan_root, this.logical_tree, this.banned_list);

    const summary = { total: 0, include: 0, filter: 0, files: [] };
    this.filesSummary = summarizeTree(this.scan_root, this.logical_tree, summary);
    console.log(
      `Total: ${this.filesSummary.total} Filter:${this.filesSummary.filter} Include:${this.filesSummary.include}`
    );
    this.filesToScan = summary.files;
    console.log(this.filesToScan);

    if (success) {
      console.log('licenses inserted successfully...');
      return true;
    }
    return false;
  }

  getLogicalTree() {
    return this.logical_tree;
  }

  attachInventory(inv: Inventory) {
    let i: number;
    let files: string[];
    files = inv.files;
    for (i = 0; i < inv.files.length; i += 1) {
      insertInventory(this.logical_tree, files[i], inv);
    }
  }

  attachComponent(comp: any) {
    for (const [key, value] of Object.entries(comp)) {
      for (let i = 0; i < value.length; i += 1) {
        // console.log(key+''+value[i].purl);
        if (value[i].purl !== undefined) insertComponent(this.logical_tree, key, value[i]);
      }
    }
  }

  set_filter_file(pathToFilter: string): boolean {
    this.banned_list.load(pathToFilter);
    return true;
  }

  getNodeFromPath(mypath: string) {
    let res: string[];
    // eslint-disable-next-line prefer-const
    if (!mypath || !mypath.includes('/')) throw new Error(`Error on path: "${mypath}`);

    res = mypath.split('/');
    if (res[0] === '') res.shift();
    if (res[res.length - 1] === '') res.pop();
    let nodes = this.logical_tree.children;
    let nodeFound: any = {};
    for (let i = 0; i < res.length - 1; i += 1) {
      const path = res[i];
       nodeFound = nodes.find((node) => {
        return (node.type === 'folder' && node.label === path);
      });
      nodes = nodeFound.children;
    }
     nodeFound = nodes.find((node) => {
      return (node.type === 'file' && node.label === res[res.length - 1]);
    });
    if (nodeFound) return nodeFound;
    return {};
  }

  get_proxy_leaf(leaf: any): any {
    if (leaf.type === 'file') return leaf;

    let j = 0;
    const ret = {
      type: 'folder',
      label: leaf.label,
      inv_count: leaf.inv_count,
      include: leaf.include,
      children: [],
      action: leaf.action,
    };
    ret.children = [];
    const children = [];
    for (j = 0; leaf.children && j < leaf.children.length; j += 1) {
      if (leaf.children[j].type === 'folder') {
        const info = {
          type: 'folder',
          label: leaf.children[j].label,
          inv_count: leaf.children[j].inv_count,
          include: leaf.children[j].include,
          action: leaf.children[j].action,
        };
        children.push(info);
      } else if (leaf.children[j].type === 'file') {
        const info = {
          type: 'file',
          label: leaf.children[j].label,
          inventories: leaf.children[j].inventories,
          include: leaf.children[j].include,
          action: leaf.children[j].action,
        };
        children.push(info);
      }
    }
    Object.assign(ret.children, children);
    return ret;
  }

  exclude_file(pathToExclude: string, recursive: boolean) {
    const a = getLeaf(this.logical_tree, pathToExclude);
    setUseFile(a, false, recursive);
  }

  include_file(pathToInclude: string, recursive: boolean) {
    const a = getLeaf(this.logical_tree, pathToInclude);
    setUseFile(a, true, recursive);
  }

  scanMode(filePath: string) {
    // eslint-disable-next-line prettier/prettier
    const skipExtentions = new Set ([".exe", ".zip", ".tar", ".tgz", ".gz", ".rar", ".jar", ".war", ".ear", ".class", ".pyc", ".o", ".a", ".so", ".obj", ".dll", ".lib", ".out", ".app", ".doc", ".docx", ".xls", ".xlsx", ".ppt" ]);
    const skipStartWith = ["{","[","<?xml","<html","<ac3d","<!doc"];
    const MIN_FILE_SIZE = 256; //In Bytes

    // Filter by extension
    const ext = path.extname(filePath);
    if (skipExtentions.has(ext)) {
      console.log(`${filePath} will scan in md5 mode. Reason: filter by extensions`);
      return 'MD5_SCAN';
    }

    // Filter by min size
    const fileSize = fs.statSync(filePath).size;
    if (fileSize < MIN_FILE_SIZE) {
      console.log(`${filePath} will scan in md5 mode. Reason: filter by extensions`);
      return 'MD5_SCAN';
    }

    // if start with pattern
    const file = fs.readFileSync(filePath, 'utf8');
    for (const skip of skipStartWith) {
      if (file.startsWith(skip)) {
        console.log(`${filePath} will scan in md5 mode. Reason: start with ${skip}`);
        return 'MD5_SCAN';
      }
    }

    // if binary
    if (isBinaryFileSync(filePath)) {
      console.log(`${filePath} will scan in md5 mode. Reason: is binary file`);
      return 'MD5_SCAN';
    }

    return 'FULL_SCAN';
  }

  indexScan(scanRoot: string, jsonScan: any, bannedList: Filtering.BannedList) {
    let i = 0;

    if (jsonScan.type === 'file') {
      this.filesIndexed += 1;
      if (this.filesIndexed % 100 === 0)
        this.msgToUI.send(IpcEvents.SCANNER_UPDATE_STATUS, {
          stage: `indexing`,
          processed: this.filesIndexed,
        });
      if (bannedList.evaluate(scanRoot + jsonScan.value)) {
        jsonScan.action = 'scan';
        jsonScan.scanMode = this.scanMode(scanRoot + jsonScan.value);
      } else {
        jsonScan.action = 'filter';
      }
    } else if (jsonScan.type === 'folder') {
      if (bannedList.evaluate(scanRoot + jsonScan.value)) {
        jsonScan.action = 'scan';
      } else {
        jsonScan.action = 'filter';
      }

      for (i = 0; i < jsonScan.children.length; i += 1) this.indexScan(scanRoot, jsonScan.children[i], bannedList);
    }
  }
}

/* AUXILIARY FUNCTIONS */

function summarizeTree(root: any, tree: any, summary: any) {
  let j = 0;
  if (tree.type === 'file') {
    summary.total += 1;
    if (tree.action === 'filter') {
      summary.filter += 1;
      tree.className = 'filter-item';
    } else if (tree.include === true) {
      summary.include += 1;
      summary.files.push({ path: `${root}${tree.value}`, scanMode: tree.scanMode });
    } else {
      tree.className = 'exclude-item';
    }

    return summary;
  }
  if (tree.type === 'folder') {
    if (tree.action === 'filter') {

      tree.className = 'filter-item';
    } else
    for (j = 0; j < tree.children.length; j += 1) {
      summary = summarizeTree(root, tree.children[j], summary);
    }
    return summary;
  }
}

function getLeaf(arbol: any, mypath: string): any {
  let res: string[];
  // eslint-disable-next-line prefer-const
  res = mypath.split('/');
  if (res[0] === '') res.shift();
  if (res[res.length - 1] === '') res.pop();

  if (arbol.label === res[0] && res.length === 1) {
    return arbol;
  }
  const i = 0;
  let j = 0;
  if (arbol.type === 'folder') {
    for (j = 0; j < arbol.children.length; j += 1) {
      if (arbol.children[j].type === 'folder' && arbol.children[j].label === res[1]) {
        const newpath = mypath.replace(`${res[0]}/`, '');
        return getLeaf(arbol.children[j], newpath);
      }
      if (arbol.children[j].type === 'file' && arbol.children[j].label === res[1]) {
        return arbol.children[j];
      }
    }
  }
}

function setUseFile(tree: any, action: boolean, recursive: boolean) {
  if (tree.type === 'file') tree.include = action;
  else {
    let j = 0;
    tree.include = action;
    if (recursive)
      for (j = 0; j < tree.children.length; j += 1) {
        setUseFile(tree.children[j], action, recursive);
      }
  }
}

function insertInventory(root: string, tree: any, mypath: string, inv: Inventory): any {
  let myPathFolders: string[];
  // eslint-disable-next-line prefer-const
  let arbol = tree;
  mypath = mypath.replace('//', '/');
  mypath = mypath.replace(root, '');
  myPathFolders = mypath.split('/');
  if (myPathFolders[0] === '') myPathFolders.shift();
  let i: number;
  i = 0;
  let childCount = 0;
  while (i < myPathFolders.length) {
    let j: number;
    if (!arbol.inventories.includes(inv.id)) arbol.inventories.push(inv.id);
    childCount = arbol.children.length;
    for (j = 0; j < arbol.children.length; j += 1) {
      if (arbol.children[j].label === myPathFolders[i]) {
        arbol = arbol.children[j];
        i += 1;
        break;
      }
    }
    if (j >= childCount) {
      console.log(`Can not insert inventory on ${mypath}`);
      return;
    }
  }

  arbol.inventories.push(inv.id);
}
function insertComponent(tree: any, mypath: string, comp: Component): any {
  let myPathFolders: string[];
  // eslint-disable-next-line prefer-const
  let arbol = tree;
  myPathFolders = mypath.split('/');
  if (myPathFolders[0] === '') myPathFolders.shift();
  let i: number;
  i = 0;
  let childCount;
  const component = { purl: comp.purl, version: comp.version };

  while (i < myPathFolders.length) {
    let j: number;
    if (!arbol.components.some((e) => e.purl === component.purl && e.version === component.version)) {
      arbol.components.push(component);
      arbol.className = 'match-info-result';
    }
    childCount = arbol.children.length;
    for (j = 0; j < childCount; j += 1) {
      if (arbol.children[j].label === myPathFolders[i]) {
        arbol = arbol.children[j];
        i += 1;
        break;
      }
    }
    if (j >= childCount) {
      console.log(`Can not insert component ${component.purl} on ${mypath}`);
      return;
    }
  }

  arbol.components.push(component);
  arbol.className = 'match-info-result';
}
/*
function recurseJSON(jsonScan: any, banned_list: Filtering.BannedList): any {
  let i = 0;
  if (jsonScan.type === 'file') {
    if (banned_list.evaluate(jsonScan.path)) {
      jsonScan.action = 'scan';
    } else {
      jsonScan.action = 'filter';
    }
  } else if (jsonScan.type === 'folder') {
    for (i = 0; i < jsonScan.children.length; i += 1) recurseJSON(jsonScan.children[i], banned_list);
  }
} */
/*
function indexScan(scanRoot: string, jsonScan: any, bannedList: Filtering.BannedList) {
  let i = 0;

  if (jsonScan.type === 'file') {
    if (bannedList.evaluate(scanRoot + jsonScan.value)) {
      jsonScan.action = 'scan';
    } else {
      jsonScan.action = 'filter';
    }
  } else if (jsonScan.type === 'folder') {
    for (i = 0; i < jsonScan.children.length; i += 1) indexScan(scanRoot, jsonScan.children[i], bannedList);
  }
}
*/
function dirFirstFileAfter(a, b) {
  if (!a.isDirectory() && b.isDirectory()) return 1;
  if (a.isDirectory() && !b.isDirectory()) return -1;
  return 0;
}

function dirTree(root: string, filename: string) {
  // console.log(filename)
  const stats = fs.lstatSync(filename);
  let info;

  if (stats.isDirectory()) {
    info = {
      type: 'folder',
      className: 'no-match',
      value: filename.replace(root, ''),
      label: path.basename(filename),
      inventories: [],
      components: [],
      children: undefined,
      include: true,
      action: 'scan',
      showCheckbox: false,
    };

    info.children = fs
      .readdirSync(filename, { withFileTypes: true }) // Returns a list of files and folders
      .sort(dirFirstFileAfter)
      .filter((dirent) => !dirent.isSymbolicLink())
      .map((dirent) => dirent.name) // Converts Dirent objects to paths
      .map((child: string) => {
        // Apply the recursion function in the whole array
        return dirTree(root, `${filename}/${child}`);
      });
  } else {
    info = {
      type: 'file',
      className: 'no-match',
      inv_count: 0,
      value: filename.replace(root, ''),
      label: path.basename(filename),
      inventories: [],
      components: [],
      include: true,
      action: 'scan',
      showCheckbox: false,
    };
  }
  return info;
}

function getUserHome() {
  // Return the value using process.env
  return os.homedir(); // process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
}
