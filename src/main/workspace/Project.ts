/* eslint-disable max-classes-per-file */
import { EventEmitter } from 'events';
import fs from 'fs';
import { isBinaryFileSync } from 'isbinaryfile';
import { Component, Inventory, IProjectCfg, ProjectState, ScanState } from '../../api/types';

import * as Filtering from './filtering';
import { ScanDb } from '../db/scan_db';
import { licenses } from '../db/licenses';
import { Scanner } from '../scannerLib/Scanner';
import { ScannerEvents } from '../scannerLib/ScannerEvents';
import { ScannerCfg } from '../scannerLib/ScannerCfg';
import { IpcEvents } from '../../ipc-events';
import { defaultBannedList } from './filtering/defaultFilter';
import { Metadata } from './Metadata';
import { userSetting } from '../UserSetting';
import { ProjectMigration } from '../migration/ProjectMigration';
import packageJson from '../../package.json';

const path = require('path');

export class Project extends EventEmitter {
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

  filesToScan: any;

  filesNotScanned: any;

  metadata: Metadata;

  state: ProjectState;

  config: IProjectCfg;

  constructor(name: string) {
    super();
    this.metadata = new Metadata(name);
    this.state = ProjectState.CLOSED;
  }

  public static async readFromPath(pathToProject: string): Promise<Project> {
    const mt: Metadata = await Metadata.readFromPath(pathToProject);
    const p: Project = new Project(mt.getName());
    p.setState(ProjectState.CLOSED);
    p.setMetadata(mt);
    return p;
  }

  public upgrade(): void {
    if (this.metadata.getVersion() === '11.4.9') {
      this.metadata.setAppVersion('0.8.0');
      this.save();
    }
    const pMigration = new ProjectMigration(this.metadata.getVersion(), this.metadata.getMyPath());
    pMigration.up();
  }

  public async open(): Promise<boolean> {
    this.state = ProjectState.OPENED;
    const project = await fs.promises.readFile(`${this.metadata.getMyPath()}/tree.json`, 'utf8');
    const a = JSON.parse(project);
    this.logical_tree = a.logical_tree;
    this.filesToScan = a.filesToScan;
    this.filesNotScanned = a.filesNotScanned;
    this.processedFiles = a.processedFiles;
    this.filesSummary = a.filesSummary;
    this.scans_db = new ScanDb(this.metadata.getMyPath());
    await this.scans_db.init();

    // const projectCfg = await fs.promises.readFile(`${this.metadata.getMyPath()}/projectCfg.json`, 'utf8');
    // const projectCfg = await fs.promises.readFile(`${this.metadata.getMyPath()}/../defaultCfg.json`, 'utf8');
    // this.config = JSON.parse(projectCfg) as IProjectCfg;

    // if(fs.existsSync(`${this.metadata.getMyPath()}/projectCfg.json`)){
    //   const pCfg = await fs.promises.readFile(`${this.metadata.getMyPath()}/projectCfg.json`, 'utf8');
    //   const pObjCfg = JSON.parse(pCfg) as IProjectCfg;
    //   this.config = (...pObjCfg, ...usertSetting.getAll()) as IProjectCfg;
    // } else {
    //   this.config = appSetting.getAll();
    // }

    return true;
  }

  public async close() {
    if (this.scanner && this.scanner.isRunning()) this.scanner.stop();
    console.log(`[ PROJECT ]: Closing project ${this.metadata.getName()}`);
    this.state = ProjectState.CLOSED;
    this.scanner = null;
    this.logical_tree = null;
    this.scans_db = null;
    this.filesToScan = null;
   // this.config = null;
  }

  public save(): void {
    this.metadata.save();
    fs.writeFileSync(`${this.metadata.getMyPath()}/tree.json`, JSON.stringify(this));
    // fs.writeFileSync(`${this.metadata.getMyPath()}/projectCfg.json`, JSON.stringify(this.config, null, 2));
    console.log(`[ PROJECT ]: Project ${this.metadata.getName()} saved`);
  }

  public async startScanner() {
    this.state = ProjectState.OPENED;
    const myPath = this.metadata.getMyPath();
    this.project_name = this.metadata.getName(); // To keep compatibility
    this.banned_list = new Filtering.BannedList('NoFilter');
    this.cleanProject();
    if (!fs.existsSync(`${myPath}/filter.json`))
      fs.writeFileSync(`${myPath}/filter.json`, JSON.stringify(defaultBannedList).toString());
    this.banned_list.load(`${myPath}/filter.json`);
    this.scans_db = new ScanDb(myPath);
    await this.scans_db.init();
    await this.scans_db.licenses.importFromJSON(licenses);
    console.log(`[ PROJECT ]: Building tree`);
    this.build_tree();
    console.log(`[ PROJECT ]: Applying filters to the tree`);
    this.indexScan(this.metadata.getScanRoot(), this.logical_tree, this.banned_list);
    const summary = { total: 0, include: 0, filter: 0, files: {} };
    this.filesSummary = summarizeTree(this.metadata.getScanRoot(), this.logical_tree, summary);
    console.log(`[ PROJECT ]: Total files: ${this.filesSummary.total} Filtered:${this.filesSummary.filter} Included:${this.filesSummary.include}`);
    this.filesToScan = summary.files;
    this.filesNotScanned = {};
    this.metadata.setScannerState(ScanState.READY_TO_SCAN);
    this.metadata.setFileCounter(summary.include);
    this.initializeScanner();
    this.scanner.cleanWorkDirectory();
    this.startScan();
  }

  public async resumeScanner() {
    this.state = ProjectState.OPENED;
    if (this.metadata.getState() !== ScanState.SCANNING) return false;
    await this.open();
    this.initializeScanner();
    console.log(`[ PROJECT ]: Resuming scanner, pending ${Object.keys(this.filesToScan).length} files`)
    this.sendToUI(IpcEvents.SCANNER_UPDATE_STATUS, {
      stage: 'scanning',
      processed: (100 * this.processedFiles) / this.filesSummary.include,
    });
    this.startScan();
    return true;
  }

  cleanProject() {
    if (fs.existsSync(`${this.metadata.getMyPath()}/results.json`)) fs.unlinkSync(`${this.metadata.getMyPath()}/results.json`);
    if (fs.existsSync(`${this.metadata.getMyPath()}/scan_db`)) fs.unlinkSync(`${this.metadata.getMyPath()}/scan_db`);
    if (fs.existsSync(`${this.metadata.getMyPath()}/tree.json`)) fs.unlinkSync(`${this.metadata.getMyPath()}/tree.json`);
  }

  initializeScanner() {
    const scannerCfg: ScannerCfg = new ScannerCfg();
    const { DEFAULT_API_INDEX, APIS } = userSetting.get();
    scannerCfg.API_URL = APIS[DEFAULT_API_INDEX].URL;
    scannerCfg.API_KEY = APIS[DEFAULT_API_INDEX].API_KEY;
    this.scanner = new Scanner(scannerCfg);
    this.scanner.setWorkDirectory(this.metadata.getMyPath());
    this.setScannerListeners();
  }

  setScannerListeners() {
    this.scanner.on(ScannerEvents.DISPATCHER_NEW_DATA, async (response) => {
      this.processedFiles += response.getNumberOfFilesScanned();
      const filesScanned = response.getFilesScanned();
      // eslint-disable-next-line no-restricted-syntax
      for (const file of filesScanned) delete this.filesToScan[`${this.metadata.getScanRoot()}${file}`];
      this.sendToUI(IpcEvents.SCANNER_UPDATE_STATUS, {
        stage: 'scanning',
        processed: (100 * this.processedFiles) / this.filesSummary.include,
      });
    });

    this.scanner.on(ScannerEvents.RESULTS_APPENDED, (response, filesNotScanned) => {
      this.attachComponent(response.getServerResponse());
      Object.assign(this.filesNotScanned, filesNotScanned);
      this.save();
    });

    this.scanner.on(ScannerEvents.SCAN_DONE, async (resPath, filesNotScanned) => {
      await this.scans_db.results.insertFromFile(resPath);
      await this.scans_db.components.importUniqueFromFile();
      this.metadata.setScannerState(ScanState.SCANNED);
      this.metadata.save();
      await this.close();
      this.sendToUI(IpcEvents.SCANNER_FINISH_SCAN, {
        success: true,
        resultsPath: this.metadata.getMyPath(),
      });
    });

    this.scanner.on('error', async (error) => {
      this.save();
      await this.close();
      this.sendToUI(IpcEvents.SCANNER_ERROR_STATUS, error);
    });
  }

  startScan() {
    console.log(`[ SCANNER ]: Start scanning path = ${this.metadata.getScanRoot()}`);
    this.sendToUI(IpcEvents.SCANNER_UPDATE_STATUS, {
      stage: 'scanning',
      processed: (100 * this.processedFiles) / this.filesSummary.include,
    });
    this.metadata.setScannerState(ScanState.SCANNING);
    this.save();
    // eslint-disable-next-line prettier/prettier
    this.scanner.scanList(this.filesToScan, this.metadata.getScanRoot());
  }

  sendToUI(eventName, data: any) {
    if (this.msgToUI) this.msgToUI.send(eventName, data);
  }

  setMailbox(mailbox: Electron.WebContents) {
    this.msgToUI = mailbox;
  }

  public setState(state: ProjectState) {
    this.state = state;
  }

  public getState() {
    return this.state;
  }

  public setMetadata(mt: Metadata) {
    this.metadata = mt;
  }

  public setScanPath(name: string) {
    this.metadata.setScanRoot(name);
  }

  public setMyPath(myPath: string) {
    this.metadata.setMyPath(myPath);
    this.metadata.save();
  }

  // public setConfig(cfg: IProjectCfg){
  //   this.config = cfg;
  // }

  public getFilesNotScanned() {
    return this.filesNotScanned;
  }

  public getMyPath() {
    return this.metadata.getMyPath();
  }

  public getProjectName() {
    return this.metadata.getName();
  }

  public getUUID(): string {
    return this.metadata.getUUID();
  }

  public getDto() {
    return this.metadata.getDto();
  }

  getScanRoot(): string {
    return this.metadata.getScanRoot();
  }

  public async getResults() {
    return JSON.parse(await fs.promises.readFile(`${this.metadata.getMyPath()}/result.json`, 'utf8'));
  }

  build_tree() {
    const scanPath = this.metadata.getScanRoot();
    this.logical_tree = dirTree(scanPath, scanPath);
    this.emit('treeBuilt', this.logical_tree);
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
    const MIN_FILE_SIZE = 256;

    // Filter by extension
    const ext = path.extname(filePath);
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

  indexScan(scanRoot: string, jsonScan: any, bannedList: Filtering.BannedList) {
    let i = 0;
    if (jsonScan.type === 'file') {
      this.filesIndexed += 1;
      if (this.filesIndexed % 100 === 0)
          this.sendToUI(IpcEvents.SCANNER_UPDATE_STATUS, {
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
        for (i = 0; i < jsonScan.children.length; i += 1) this.indexScan(scanRoot, jsonScan.children[i], bannedList);
      } else {
        jsonScan.action = 'filter';
      }


    }
  }


  public getToken(){
    const txt = fs.readFileSync(`${this.metadata.getMyPath()}/projectCfg.json`,'utf8');
    const cfg = JSON.parse(txt);
    return cfg.TOKEN;
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
      summary.files[`${root}${tree.value}`] = tree.scanMode;
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
        const newpath = mypath.replace(`${res[0]}`, '');
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
      action: 'filter',
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
      action: 'filter',
      showCheckbox: false,
    };
  }
  return info;
}
