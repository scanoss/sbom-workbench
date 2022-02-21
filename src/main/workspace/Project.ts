/* eslint-disable max-classes-per-file */
import { EventEmitter } from 'events';
import fs from 'fs';
import log from 'electron-log';
import { Scanner, ScannerCfg, ScannerEvents, ScannerInput, WinnowingMode } from 'scanoss';
import {
  ComponentSource,
  File,
  FileTreeViewMode,
  IProjectCfg,
  IWorkbenchFilter,
  ProjectState,
  ScanState,
} from '../../api/types';
import * as Filtering from './filtering';
import { ScanModel } from '../db/ScanModel';
import { licenses } from '../db/licenses';
import { IpcEvents } from '../../ipc-events';
import { defaultBannedList } from './filtering/defaultFilter';
import { Metadata } from './Metadata';
import { userSetting } from '../UserSetting';
import { ProjectMigration } from '../migration/ProjectMigration';
import { Tree } from './Tree/Tree/Tree';
import { reScanService } from '../services/RescanLogicService';
import { logicComponentService } from '../services/LogicComponentService';
import { serviceProvider } from '../services/ServiceProvider';
import { QueryBuilderCreator } from '../queryBuilder/QueryBuilderCreator';
import { NodeStatus } from './Tree/Tree/Node';
import Folder from './Tree/Tree/Folder';

export class Project extends EventEmitter {
  work_root: string;

  scan_root: string;

  project_name: string;

  banned_list: Filtering.BannedList;

  logical_tree: Tree;

  tree: Tree;

  results: any;

  store!: ScanModel;

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

  filter: IWorkbenchFilter;

  fileTreeViewMode: FileTreeViewMode;

  constructor(name: string) {
    super();
    this.metadata = new Metadata(name);
    this.state = ProjectState.CLOSED;
    this.filter = null;
    this.fileTreeViewMode = FileTreeViewMode.DEFAULT;
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
    this.store = new ScanModel(this.metadata.getMyPath());
    await this.store.init();
    serviceProvider.setModel(this.store);
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
    this.store = null;
    this.filesToScan = null;
  }

  public save(): void {
    this.metadata.save();
    const self = this;
    const a = {
      filesToScan: self.filesToScan,
      filesNotScanned: self.filesNotScanned,
      processedFiles: self.processedFiles,
      filesSummary: self.filesSummary,
      tree: self.tree,
    };
    fs.writeFileSync(`${this.metadata.getMyPath()}/tree.json`, JSON.stringify(a));
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

    const scanIn = this.adapterToScannerInput(this.filesToScan);
    this.scanner.scan(scanIn);
    // this.scanner.scanList(this.filesToScan, this.metadata.getScanRoot());
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
    this.store = new ScanModel(myPath);
    await this.store.init();
    await this.store.license.importFromJSON(licenses);
    serviceProvider.setModel(this.store);
    log.info(`%c[ PROJECT ]: Building tree`, 'color: green');
    this.build_tree();
    log.info(`%c[ PROJECT ]: Applying filters to the tree`, 'color: green');
    this.tree.applyFilters(this.metadata.getScanRoot(), this.tree.getRootFolder(), this.banned_list);
    const summary = { total: 0, include: 0, filter: 0, files: {} };
    this.filesSummary = this.tree.summarize(this.metadata.getScanRoot(), summary);
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

    const scanIn = this.adapterToScannerInput(summary.files);
    this.scanner.scan(scanIn);
  }

  private adapterToScannerInput(filesToScan: Record<string, string>): Array<ScannerInput> {
    const fullScanList: Array<string> = [];
    const quickScanList: Array<string> = [];

    for (const filePath of Object.keys(filesToScan)) {
      if (filesToScan[filePath] === 'MD5_SCAN') {
        quickScanList.push(filePath);
      } else {
        fullScanList.push(filePath);
      }
    }

    const result: Array<ScannerInput> = [];

    if (fullScanList.length > 0) {
      result.push({
        fileList: fullScanList,
        folderRoot: this.metadata.getScanRoot(),
        winnowingMode: WinnowingMode.FULL_WINNOWING,
      });
    }

    if (quickScanList.length > 0) {
      result.push({
        fileList: quickScanList,
        folderRoot: this.metadata.getScanRoot(),
        winnowingMode: WinnowingMode.WINNOWING_ONLY_MD5,
      });
    }
    return result;
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

    scannerCfg.CONCURRENCY_LIMIT = 20;
    scannerCfg.DISPATCHER_QUEUE_SIZE_MAX_LIMIT = 500;
    scannerCfg.DISPATCHER_QUEUE_SIZE_MIN_LIMIT = 450;

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
        await reScanService.reScan(this.tree.getRootFolder().getFiles(), resultPath);
        const results = await reScanService.getNewResults();
        this.tree.sync(results);
        this.save();
      } else {
        await this.store.file.insertFiles(this.tree.getRootFolder().getFiles());
        const files: Array<any> = await this.store.file.getAll(null);
        const aux = files.reduce((previousValue, currentValue) => {
          previousValue[currentValue.path] = currentValue.id;
          return previousValue;
        }, []);
        await this.store.result.insertFromFile(resultPath, aux);
        // await logicService.logicComponentService.importComponents()
        await logicComponentService.importComponents();
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
    this.tree.setMailbox(this.msgToUI);
    this.tree.buildTree();
    this.emit('treeBuilt', this.logical_tree);
  }

  public getTree(): Tree {
    return this.tree;
  }

  public updateTree() {
    this.save();
    this.notifyTree();
  }

  public async notifyTree() {
    let tree: any = null;
    if (!this.filter || (this.filter.source === ComponentSource.ENGINE && Object.keys(this.filter).length === 1)) {
      tree = this.getTree().getRootFolder();
      this.sendToUI(IpcEvents.TREE_UPDATED, tree);
      return;
    }
    let files: any = await serviceProvider.model.file.getAll(
      QueryBuilderCreator.create({ ...this.filter, path: null })
    );
    files = files.reduce((acc: any, curr: any) => {
      if (!acc[curr.path]) acc[curr.path] = curr.id;
      return acc;
    }, {});
    if (this.fileTreeViewMode === FileTreeViewMode.DEFAULT) {
      tree = this.getTree().getRootFolder().getClone();
      tree.filter(files);
      this.sendToUI(IpcEvents.TREE_UPDATED, tree);
      return;
    }
    tree = this.getTree().getRootFolder().getClonePath(files);
    if (!tree) {
      tree = new Folder('', this.getProjectName());
    }
    this.sendToUI(IpcEvents.TREE_UPDATED, tree);
  }

  set_filter_file(pathToFilter: string): boolean {
    this.banned_list.load(pathToFilter);
    return true;
  }

  public getNode(path: string) {
    return this.tree.getNode(path);
  }

  public getToken() {
    return this.metadata.getToken();
  }

  public async setFilter(filter: IWorkbenchFilter) {
    try {
      this.filter = filter;
      this.notifyTree();
      return true;
    } catch (e) {
      log.error(e);
      return e;
    }
  }

  public getFilter(): IWorkbenchFilter {
    return this.filter;
  }

  public setFileTreeViewMode(mode: FileTreeViewMode) {
    this.fileTreeViewMode = mode;
    this.notifyTree();
  }
}
