/* eslint-disable max-classes-per-file */
import { EventEmitter } from 'events';
import * as os from 'os';
import { connect } from 'http2';
import * as fs from 'fs';
import { Inventory, Project } from '../../api/types';
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
import { SCANNER_EVENTS } from '../scannerLib/ScannerEvents';
import { IpcEvents } from '../../ipc-events';

// const fs = require('fs');
const path = require('path');

// const { EventEmitter } = require('events');

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
    this.scans_db = new ScanDb(rootOfProject);
    await this.scans_db.init();
    this.scanner = new Scanner();
  }

  saveScanProject() {
    const file = fs.writeFileSync(`${this.work_root}/tree.json`, JSON.stringify(this).toString());
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
    if (!fs.existsSync(`${getUserHome()}/scanoss-workspace`)) {
      fs.mkdirSync(`${getUserHome()}/scanoss-workspace/`);
    }
    if (!fs.existsSync(p.work_root)) {
      fs.mkdirSync(p.work_root);
    } else {
      //  this.msgToUI.send(IpcEvents.SCANNER_ERROR_STATUS, { reason: 'projectExists', severity: 'warning' });
      // this.cleanProject();
    }

    this.scans_db = new ScanDb(p.work_root);

    this.scanner = new Scanner();
    this.scanner.setResultsPath(this.work_root);
    this.setScannerListeners();
  }

  cleanProject() {
    console.log(`${this.work_root}/tree.json`);
    if (fs.existsSync(`${this.work_root}/results.json`)) fs.unlinkSync(`${this.work_root}/results.json`);
    if (fs.existsSync(`${this.work_root}/scan_db`)) fs.unlinkSync(`${this.work_root}/scan_db`);
    if (fs.existsSync(`${this.work_root}/tree.json`)) fs.unlinkSync(`${this.work_root}/tree.json`);
  }

  // Return fileList
  setScannerListeners() {
    this.scanner.on(SCANNER_EVENTS.WINNOWING_STARTING, () => console.log('Starting Winnowing...'));
    this.scanner.on(SCANNER_EVENTS.WINNOWING_NEW_WFP_FILE, (dir) => console.log(`New WFP File on: ${dir}`));
    this.scanner.on(SCANNER_EVENTS.WINNOWING_FINISHED, () => console.log('Winnowing Finished...'));
    this.scanner.on(SCANNER_EVENTS.DISPATCHER_WFP_SENDED, (dir) => console.log(`Sending WFP file ${dir} to server`));

    this.scanner.on(SCANNER_EVENTS.DISPATCHER_NEW_DATA, async (data, fileNumbers) => {
      this.processedFiles += fileNumbers;
      // console.log(`New ${fileNumbers} files scanned`);
      this.msgToUI.send(IpcEvents.SCANNER_UPDATE_STATUS, {
        stage: 'scanning',
        processed: this.filesSummary.include,
        completed: (100 * this.processedFiles) / this.filesSummary.include,
      });
      await this.scans_db.components.importUniqueFromJSON(data);
      await this.scans_db.results.insertFromJSON(data);
      await this.scans_db.files.insertFromJSON(data);
    });

    this.scanner.on(SCANNER_EVENTS.SCAN_DONE, async (resPath) => {
      console.log(`Scan Finished... Results on: ${resPath}`);
      const a = fs.readFileSync(`${resPath}`, 'utf8');
      this.results = JSON.parse(a);
      this.saveScanProject();

      this.msgToUI.send(IpcEvents.SCANNER_FINISH_SCAN, {
        success: true,
        resultsPath: this.work_root,
      });
    });

    this.scanner.on('error', (error) => {
      this.scanner.pause();
      console.log(error.message);
      this.msgToUI.send(IpcEvents.SCANNER_ERROR_STATUS, error);
    });
  }

  startScan() {
    console.log(`SCANNER: Start scanning path=${this.scan_root}`);

    this.scanner.scanJsonList(this.filesToScan);
   // this.scanner.scanFolder(this.scan_root);
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
      stage: 'prepare',
      processed: 30,
    });
    // const i = 0;
    this.build_tree();
    this.msgToUI.send(IpcEvents.SCANNER_UPDATE_STATUS, {
      stage: 'prepare',
      processed: 60,
    });
    // apply filters.
    this.banned_list.loadDefault();
    prepareScan(this.scan_root, this.logical_tree, this.banned_list);

    const summary = { total: 0, include: 0, filter: 0, files: [] };
    this.filesSummary = summarizeTree(this.scan_root,this.logical_tree, summary);
    console.log(
      `Total: ${this.filesSummary.total} Filter:${this.filesSummary.filter} Include:${this.filesSummary.include}`
    );
    this.filesToScan = summary.files;
    console.log(this.filesToScan);
    this.msgToUI.send(IpcEvents.SCANNER_UPDATE_STATUS, {
      stage: 'prepare',
      processed: 100,
    });

    if (success) {
      console.log('lienses inserted successfully...');
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
      insertComponent(this.logical_tree, files[i], inv);
    }
  }

  set_filter_file(pathToFilter: string): boolean {
    this.banned_list.load(pathToFilter);
    return true;
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
}

/* AUXILIARY FUNCTIONS */

function summarizeTree(root: any,tree: any, summary: any) {
  let j = 0;
  if (tree.type === 'file') {
    summary.total += 1;
    if (tree.action === 'filter') summary.filter += 1;
    else if (tree.include === true) {
      summary.include += 1;
      summary.files.push(`${root}/${tree.value}`);
    }

    return summary;
  }
  if (tree.type === 'folder') {
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

function insertInventory(tree: any, mypath: string, inv: Inventory): any {
  let myPathFolders: string[];
  // eslint-disable-next-line prefer-const
  let arbol = tree;
  myPathFolders = mypath.split('/');
  if (myPathFolders[0] === '') myPathFolders.shift();
  let i: number;
  i = 0;

  while (i < myPathFolders.length) {
    let j: number;
    if (!arbol.inventories.includes(inv.id)) arbol.inventories.push(inv.id);
    // console.log(`busco ${myPathFolders[i]}`);
    for (j = 0; j < arbol.children.length; j += 1) {
      if (arbol.children[j].label === myPathFolders[i]) {
        arbol = arbol.children[j];
        i += 1;
        break;
      }
    }
  }

  arbol.inventories.push(inv.id);
}
// 4= arr.some(e => e.name === obj.name);
function insertComponent(tree: any, mypath: string, inv: Inventory): any {
  let myPathFolders: string[];
  // eslint-disable-next-line prefer-const
  let arbol = tree;
  myPathFolders = mypath.split('/');
  if (myPathFolders[0] === '') myPathFolders.shift();
  let i: number;
  i = 0;
  const component = { purl: inv.purl, version: inv.version };
  while (i < myPathFolders.length) {
    let j: number;
    //  if (!arbol.components.includes(component)) arbol.components.push(component);
    if (!arbol.components.some((e) => e.purl === component.purl && e.version === component.version)) {
      arbol.components.push(component);
      arbol.className = 'match';
    }
    // console.log(`busco ${myPathFolders[i]}`);
    for (j = 0; j < arbol.children.length; j += 1) {
      if (arbol.children[j].label === myPathFolders[i]) {
        arbol = arbol.children[j];
        i += 1;
        break;
      }
    }
  }

  arbol.components.push(component);
  arbol.className = 'match';
  // console.log(arbol);
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

function prepareScan(scanRoot: string, jsonScan: any, bannedList: Filtering.BannedList) {
  let i = 0;

  if (jsonScan.type === 'file') {
    if (bannedList.evaluate(scanRoot + jsonScan.value)) {
      jsonScan.action = 'scan';
    } else {
      jsonScan.action = 'filter';
    }
  } else if (jsonScan.type === 'folder') {
    for (i = 0; i < jsonScan.children.length; i += 1) prepareScan(scanRoot, jsonScan.children[i], bannedList);
  }
}

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
