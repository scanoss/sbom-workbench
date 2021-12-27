/* eslint-disable max-classes-per-file */
import { EventEmitter } from 'events';
import fs from 'fs';
import { isBinaryFileSync } from 'isbinaryfile';
import log from 'electron-log';
import { Component, Inventory, IProject, IProjectCfg, ProjectState, ScanState } from '../../api/types';
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
import { Tree } from './Tree/Tree/Tree';
import Node, { NodeStatus } from './Tree/Tree/Node';
import { reScanService } from '../services/RescanLogicService';
import { logicComponentService } from '../services/LogicComponentService';


const path = require('path');

export class Project extends EventEmitter {
  work_root: string;

  scan_root: string;

  project_name: string;

  banned_list: Filtering.BannedList;

  logical_tree: Tree;

  tree: Tree;

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

  public async upgrade() {
    if (this.metadata.getVersion() === '11.4.9') {
      this.metadata.setAppVersion('0.8.0');
      this.metadata.save();
    }
    const pMigration = new ProjectMigration(this.metadata.getVersion(), this.metadata.getMyPath());
    const newVersion: string = await pMigration.up();
    this.metadata = await Metadata.readFromPath(this.metadata.getMyPath());
    this.metadata.setAppVersion(newVersion);
    this.metadata.save();
  }

  public async open(): Promise<boolean> {
    this.state = ProjectState.OPENED;
    log.transports.file.resolvePath = () => `${this.metadata.getMyPath()}/project.log`;
    const project = await fs.promises.readFile(`${this.metadata.getMyPath()}/tree.json`, 'utf8');

    const a = JSON.parse(project);
    this.filesToScan = a.filesToScan;
    this.filesNotScanned = a.filesNotScanned;
    this.processedFiles = a.processedFiles;
    this.filesSummary = a.filesSummary;
    this.scans_db = new ScanDb(this.metadata.getMyPath());
    await this.scans_db.init();
    this.metadata = await Metadata.readFromPath(this.metadata.getMyPath());
    this.tree = new Tree(this.metadata.getMyPath());
    this.tree.loadTree(a.tree.rootFolder);
    return true;
  }

  public async close() {
    if (this.scanner && this.scanner.isRunning()) this.scanner.stop();
    log.info(`%c[ PROJECT ]: Closing project ${this.metadata.getName()}`, 'color: green');
    this.state = ProjectState.CLOSED;
    this.scanner = null;
    this.logical_tree = null;
    this.tree = null;
    this.scans_db = null;
    this.filesToScan = null;
  }

  public save(): void {
    this.metadata.save();
    fs.writeFileSync(`${this.metadata.getMyPath()}/tree.json`, JSON.stringify(this));
    log.info(`%c[ PROJECT ]: Project ${this.metadata.getName()} saved`, 'color:green');
  }

  public async startScanner() {
    this.metadata.setScannerState(ScanState.SCANNING);
    await this.startScan();
  }

  public async reScan() {
    this.metadata.setScannerState(ScanState.RESCANNING);
    await this.startScan();
  }

  public async resumeScanner() {
    const scanState: ScanState = this.metadata.getScannerState();
    if (scanState !== ScanState.SCANNING && scanState !== ScanState.RESCANNING)
      throw new Error('Cannot resume project');

    await this.open();
    this.initializeScanner();
    log.info(`%c[ PROJECT ]: Resuming scanner, pending ${Object.keys(this.filesToScan).length} files`, 'color: green');
    this.sendToUI(IpcEvents.SCANNER_UPDATE_STATUS, {
      stage: scanState,
      processed: (100 * this.processedFiles) / this.filesSummary.include,
    });
    this.scanner.scanList(this.filesToScan, this.metadata.getScanRoot());
    return true;
  }

  private async startScan(): Promise<void> {
    log.transports.file.resolvePath = () => `${this.metadata.getMyPath()}/project.log`;
    this.state = ProjectState.OPENED;
    const myPath = this.metadata.getMyPath();
    this.banned_list = new Filtering.BannedList('NoFilter');
    if (!fs.existsSync(`${myPath}/filter.json`))
      fs.writeFileSync(`${myPath}/filter.json`, JSON.stringify(defaultBannedList).toString());
    this.banned_list.load(`${myPath}/filter.json`);
    this.scans_db = new ScanDb(myPath);
    await this.scans_db.init();
    await this.scans_db.licenses.importFromJSON(licenses);
    log.info(`%c[ PROJECT ]: Building tree`, 'color: green');
    this.build_tree();
    log.info(`%c[ PROJECT ]: Applying filters to the tree`, 'color: green');
    this.indexScan(this.metadata.getScanRoot(), this.tree.getRootFolder(), this.banned_list);
    const summary = { total: 0, include: 0, filter: 0, files: {} };
    this.filesSummary = summarizeTree(this.metadata.getScanRoot(), this.tree.getRootFolder(), summary);
    log.info(
      `%c[ PROJECT ]: Total files: ${this.filesSummary.total} Filtered:${this.filesSummary.filter} Included:${this.filesSummary.include}`,
      'color: green'
    );
    this.filesToScan = summary.files;
    this.filesNotScanned = {};
    this.processedFiles = 0;
    this.metadata.setFileCounter(summary.include);
    this.initializeScanner();
    this.scanner.cleanWorkDirectory();
    this.save();
    log.info(`%c[ SCANNER ]: Start scanning path = ${this.metadata.getScanRoot()}`, 'color: green');
    this.sendToUI(IpcEvents.SCANNER_UPDATE_STATUS, {
      stage: this.metadata.getScannerState(),
      processed: 0,
    });
    this.scanner.scanList(this.filesToScan, this.metadata.getScanRoot());
  }

  cleanProject() {
    if (fs.existsSync(`${this.metadata.getMyPath()}/results.json`))
      fs.unlinkSync(`${this.metadata.getMyPath()}/results.json`);
    if (fs.existsSync(`${this.metadata.getMyPath()}/scan_db`)) fs.unlinkSync(`${this.metadata.getMyPath()}/scan_db`);
    if (fs.existsSync(`${this.metadata.getMyPath()}/tree.json`))
      fs.unlinkSync(`${this.metadata.getMyPath()}/tree.json`);
  }

  initializeScanner() {
    const scannerCfg: ScannerCfg = new ScannerCfg();
    const { DEFAULT_API_INDEX, APIS } = userSetting.get();

    if (this.metadata.getApi()) {
      scannerCfg.API_URL = this.metadata.getApi();
    } else {
      scannerCfg.API_URL = APIS[DEFAULT_API_INDEX].URL;
      scannerCfg.API_KEY = APIS[DEFAULT_API_INDEX].API_KEY;
    }

    this.scanner = new Scanner(scannerCfg);
    this.scanner.setWorkDirectory(this.metadata.getMyPath());

    this.scanner.on(ScannerEvents.DISPATCHER_NEW_DATA, async (response) => {
      this.processedFiles += response.getNumberOfFilesScanned();
      const filesScanned = response.getFilesScanned();
      // eslint-disable-next-line no-restricted-syntax
      for (const file of filesScanned) delete this.filesToScan[`${this.metadata.getScanRoot()}${file}`];
      this.sendToUI(IpcEvents.SCANNER_UPDATE_STATUS, {
        stage: this.metadata.getScannerState(),
        processed: (100 * this.processedFiles) / this.filesSummary.include,
      });
    });

    this.scanner.on(ScannerEvents.RESULTS_APPENDED, (response, filesNotScanned) => {
      this.tree.attachResults(response.getServerResponse());
      Object.assign(this.filesNotScanned, filesNotScanned);
      this.save();
    });

    this.scanner.on(ScannerEvents.SCAN_DONE, async (resultPath, filesNotScanned) => {
      if (this.metadata.getScannerState() === ScanState.RESCANNING) {
        log.info(`%c[ SCANNER ]: Re-scan finished `, 'color: green');
        await reScanService.reScan(this.tree.getRootFolder().getFiles(), resultPath, this);
        await logicComponentService.importComponents(this.scans_db);
        const results = await reScanService.getNewResults(this);
        this.tree.sync(results);
        this.save();
      } else {
        await this.scans_db.files.insertFiles(this.tree.getRootFolder().getFiles());
        const files: any = await this.scans_db.files.getFiles();
        const aux = files.reduce((previousValue, currentValue) => {
          previousValue[currentValue.path] = currentValue.fileId;
          return previousValue;
        }, []);
        await this.scans_db.results.insertFromFile(resultPath, aux);
        await logicComponentService.importComponents(this.scans_db);
      }

      this.metadata.setScannerState(ScanState.FINISHED);
      this.metadata.save();
      await this.close();
      this.sendToUI(IpcEvents.SCANNER_FINISH_SCAN, {
        success: true,
        resultsPath: this.metadata.getMyPath(),
      });
    });

    this.scanner.on(ScannerEvents.SCANNER_LOG, (message, level) => {
      log.info(`%c${message}`, 'color: green');
    });

    this.scanner.on('error', async (error) => {
      this.save();
      await this.close();
      this.sendToUI(IpcEvents.SCANNER_ERROR_STATUS, error);
    });
  }

  public refreshTree(filesToUpdate) {
    console.log(filesToUpdate);
    console.log(JSON.stringify(this.logical_tree, null, 2));
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(filesToUpdate)) {
      this.updateStatusOfFile(key.split('/').splice(1), 0, this.logical_tree, value);
    }
    this.logical_tree.status = this.getFolderStatus(this.logical_tree);
    console.log(JSON.stringify(this.logical_tree, null, 2));
    // this.msgToUI(IpcEvents.COMPONENT_ATTACH_LICENSE, this.logical_tree);
  }

  private updateStatusOfFile(arrPaths, deep, current, status) {
    if (deep >= arrPaths.length) {
      current.status = status;
      return;
    }
    const next = current.children.find((child) => child.label === arrPaths[deep]);
    this.updateStatusOfFile(arrPaths, deep + 1, next, status);
    next.status = this.getFolderStatus(next);
  }

  private getFolderStatus(node: any) {
    if (node.type !== 'folder') return node.status;
    if (node.children.some((child) => child.status === 'pending')) return 'pending';
    if (node.children.every((child) => child.status === 'ignored')) return 'ignored';
    return 'identified';
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

  public setLicense(license: string) {
    this.metadata.setLicense(license);
  }

  public setMyPath(myPath: string) {
    this.metadata.setMyPath(myPath);
    this.metadata.save();
  }

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

  public getScanRoot(): string {
    return this.metadata.getScanRoot();
  }

  public setApi(api: string) {
    this.metadata.setApi(api);
  }

  public setToken(token: string) {
    this.metadata.setToken(token);
  }

  public setApiKey(apiKey: string) {
    this.metadata.setApiKey(apiKey);
  }

  public async getResults() {
    return JSON.parse(await fs.promises.readFile(`${this.metadata.getMyPath()}/result.json`, 'utf8'));
  }

  build_tree() {
    const scanPath = this.metadata.getScanRoot();
    this.tree = new Tree(scanPath);
    this.tree.buildTree();
    // this.logical_tree = dirTree(scanPath, scanPath);
    this.emit('treeBuilt', this.logical_tree);
  }

  public getTree(): Tree {
    return this.tree;
  }

  public updateTree() {
    this.save();
    this.sendToUI(IpcEvents.TREE_UPDATED, this.tree.getRootFolder());
  }

  attachInventory(inv: Inventory) {
    let i: number;
    let files: string[];
    files = inv.files;
    for (i = 0; i < inv.files.length; i += 1) {
      // this.logical_tree.insertInventory();
      insertInventory(this.tree.getRootFolder(), files[i], inv);
    }
  }

  attachComponent(comp: any) {
    for (const [key, value] of Object.entries(comp)) {
      for (let i = 0; i < value.length; i += 1) {
        // console.log(key+''+value[i].purl);
        if (value[i].purl !== undefined) insertComponent(this.tree.getRootFolder(), key, value[i]);
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
    let nodes = this.getTree().getRootFolder().children;
    let nodeFound: any = {};
    for (let i = 0; i < res.length - 1; i += 1) {
      const path = res[i];
      nodeFound = nodes.find((node) => {
        return node.type === 'folder' && node.label === path;
      });
      nodes = nodeFound.children;
    }
    nodeFound = nodes.find((node) => {
      return node.type === 'file' && node.label === res[res.length - 1];
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
    const a = getLeaf(this.tree.getRootFolder(), pathToExclude);
    setUseFile(a, false, recursive);
  }

  include_file(pathToInclude: string, recursive: boolean) {
    const a = getLeaf(this.tree.getRootFolder(), pathToInclude);
    setUseFile(a, true, recursive);
  }

  scanMode(filePath: string) {
    // eslint-disable-next-line prettier/prettier
    const skipExtentions = new Set ([".exe", ".zip", ".tar", ".tgz", ".gz", ".rar", ".jar", ".war", ".ear", ".class", ".pyc", ".o", ".a", ".so", ".obj", ".dll", ".lib", ".out", ".app", ".doc", ".docx", ".xls", ".xlsx", ".ppt" ]);
    const skipStartWith = ['{', '[', '<?xml', '<html', '<ac3d', '<!doc'];
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

  indexScan(scanRoot: string, jsonScan: Node, bannedList: Filtering.BannedList) {
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
        jsonScan.status = NodeStatus.FILTERED;
        jsonScan.className = 'filter-item';
      }
    } else if (jsonScan.type === 'folder') {
      if (bannedList.evaluate(scanRoot + jsonScan.value)) {
        jsonScan.action = 'scan';
        for (i = 0; i < jsonScan.children.length; i += 1) this.indexScan(scanRoot, jsonScan.children[i], bannedList);
      } else {
        jsonScan.action = 'filter';
        jsonScan.status = NodeStatus.FILTERED;
        jsonScan.className = 'filter-item';
      }
    }
  }

  public getToken() {
    return this.metadata.getToken();
  }

  public getNode(path: string) {
    return this.tree.getNode(path);
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
      arbol.className = 'match-info-result status-pending';
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
  arbol.className = 'match-info-result status-pending';
}

function dirFirstFileAfter(a, b) {
  if (!a.isDirectory() && b.isDirectory()) return 1;
  if (a.isDirectory() && !b.isDirectory()) return -1;
  return 0;
}

function dirTree(root: string, filename: string) {
  const stats = fs.lstatSync(filename);
  let info;

  if (stats.isDirectory()) {
    info = {
      type: 'folder',
      className: 'no-match status-pending',
      value: filename.replace(root, ''),
      label: path.basename(filename),
      inventories: [],
      components: [],
      children: [],
      include: true,
      action: 'filter',
      showCheckbox: false,
      status: 'pending',
    };

    console.log('parent', filename);
    info.children = fs
      .readdirSync(filename, { withFileTypes: true }) // Returns a list of files and folders
      .sort(dirFirstFileAfter)
      .filter((dirent) => !dirent.isSymbolicLink())
      .map((dirent) => dirent.name) // Converts Dirent objects to paths
      .map((child: string) => {
        // Apply the recursion function in the whole array
        console.log('child:', child);
        return dirTree(root, `${filename}/${child}`);
      });
  } else {
    info = {
      type: 'file',
      className: 'no-match status-pending',
      inv_count: 0,
      value: filename.replace(root, ''),
      label: path.basename(filename),
      inventories: [],
      components: [],
      children: [],
      include: true,
      action: 'filter',
      showCheckbox: false,
      status: 'pending',
    };
  }
  return info;
}
