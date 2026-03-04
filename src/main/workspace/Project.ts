/* eslint-disable max-classes-per-file */
import fs from 'fs';
import log from 'electron-log';
import { IDependencyResponse, Scanner } from 'scanoss';
import { FileTreeViewMode, IProjectCfg, IWorkbenchFilter, IWorkbenchFilterParams, ProjectState } from '../../api/types';
import { ProjectModel } from '../model/project/ProjectModel';
import { Metadata } from './Metadata';
import { ProjectMigration } from '../migration/ProjectMigration';
import { Tree } from './tree/Tree';
import { modelProvider } from '../services/ModelProvider';
import { TreeViewModeCreator } from './tree/treeViewModes/TreeViewModeCreator';
import { IpcChannels } from '../../api/ipc-channels';
import * as ScannerCFG from '../task/scanner/types';
import { broadcastManager } from '../broadcastManager/BroadcastManager';
import { userSettingService } from '../services/UserSettingService';
import { normalizeProjectScanState } from './projectScanState';
import {
  createTreeSnapshotRef,
  isTreeSnapshotRef,
  readTreeSnapshot,
  TREE_STATE_SCHEMA_VERSION,
  writeTreeSnapshot,
} from './projectTreeSnapshot';

interface ILegacyProjectState {
  filesToScan?: unknown;
  filesNotScanned?: unknown;
  processedFiles?: unknown;
  filesSummary?: unknown;
  tree?: {
    rootFolder?: {
      label?: string;
    };
  };
  schemaVersion?: number;
  treeSnapshot?: unknown;
}

export class Project {
  work_root: string;

  scan_root: string;

  project_name: string;

  logical_tree: Tree;

  tree: Tree;

  results: any;

  store!: ProjectModel;

  scanner!: Scanner;

  filesSummary: any;

  processedFiles = 0;

  filesToScan: any;

  filesNotScanned: any;

  metadata: Metadata;

  state: ProjectState;

  config: IProjectCfg;

  filter: IWorkbenchFilter;

  fileTreeViewMode: FileTreeViewMode;

  private hasSnapshotOnDisk: boolean;

  constructor(name: string) {
    this.metadata = new Metadata(name);
    this.state = ProjectState.CLOSED;
    this.filter = null;
    this.fileTreeViewMode = FileTreeViewMode.DEFAULT;
    this.tree = null;
    this.filesToScan = {};
    this.hasSnapshotOnDisk = false;
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
    log.transports.file.resolvePath = () => `${this.metadata.getMyPath()}/project.log`; // Concatenate workspace root
    const project = await fs.promises.readFile(`${this.metadata.getMyPath()}/tree.json`, 'utf8');
    const a = JSON.parse(project) as ILegacyProjectState;
    const normalized = normalizeProjectScanState(
      a.filesToScan,
      a.filesNotScanned,
      a.processedFiles,
      a.filesSummary,
    );
    this.filesToScan = normalized.filesToScan;
    this.filesNotScanned = normalized.filesNotScanned;
    this.processedFiles = normalized.processedFiles;
    this.filesSummary = normalized.filesSummary;
    await modelProvider.init(this.metadata.getMyPath());
    this.metadata = await Metadata.readFromPath(this.metadata.getMyPath());

    if (a.schemaVersion === TREE_STATE_SCHEMA_VERSION && isTreeSnapshotRef(a.treeSnapshot)) {
      const snapshotPath = `${this.metadata.getMyPath()}/${a.treeSnapshot.file}`;
      if (fs.existsSync(snapshotPath)) {
        this.tree = await readTreeSnapshot({
          projectPath: this.metadata.getMyPath(),
          snapshotFile: a.treeSnapshot.file,
          defaultRootName: this.metadata.getName(),
          defaultScanRoot: this.metadata.getScanRoot(),
        });
        this.hasSnapshotOnDisk = true;
        return true;
      }
      log.warn(`[ PROJECT ]: Missing tree snapshot file ${snapshotPath}. Falling back to legacy tree payload`);
    }

    if (a.tree?.rootFolder) {
      this.tree = new Tree(a.tree.rootFolder.label, this.metadata.getMyPath(), a.tree.rootFolder.label);
      this.tree.loadTree(a.tree.rootFolder);
      this.hasSnapshotOnDisk = false;
      return true;
    }

    this.tree = new Tree(this.metadata.getName(), this.metadata.getMyPath(), this.metadata.getScanRoot());
    this.hasSnapshotOnDisk = false;
    return true;
  }

  public async close() {
    if (this.state === ProjectState.CLOSED) {
      log.info(`%c[ PROJECT ]: Project ${this.metadata.getName()} is already closed, skipping`, 'color: green');
      return;
    }
    log.info(`%c[ PROJECT ]: Closing project ${this.metadata.getName()}`, 'color: green');
    log.info('%c[ PROJECT ]: Closing Database', 'color: green');
    this.state = ProjectState.CLOSED;
    if (modelProvider.model) {
      await modelProvider.model.destroy();
    }
    this.logical_tree = null;
    this.tree = null;
    this.store = null;
    this.filesToScan = null;
    this.filter = null;
    this.hasSnapshotOnDisk = false;
    if (this.scanner && this.scanner.isRunning()) this.scanner.stop();
    this.scanner = null;
  }

  public save(): void {
    this.saveState();
  }

  public saveState(): void {
    if (this.tree && !this.hasSnapshotOnDisk) {
      this.saveTreeSnapshot();
    }
    this.metadata.save();
    const a = {
      schemaVersion: TREE_STATE_SCHEMA_VERSION,
      filesToScan: this.filesToScan,
      filesNotScanned: this.filesNotScanned,
      processedFiles: this.processedFiles,
      filesSummary: this.filesSummary,
      treeSnapshot: this.tree ? createTreeSnapshotRef() : null,
    };
    fs.writeFileSync(`${this.metadata.getMyPath()}/tree.json`, JSON.stringify(a));
    log.info(`%c[ PROJECT ]: Project ${this.metadata.getName()} saved`, 'color:green');
  }

  public saveTreeSnapshot(): void {
    if (!this.tree) return;
    writeTreeSnapshot(this.metadata.getMyPath(), this.tree);
    this.hasSnapshotOnDisk = true;
  }

  public saveWithSnapshot(): void {
    try {
      this.saveTreeSnapshot();
      this.saveState();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      log.error(`[ PROJECT ]: Failed persisting tree snapshot - ${message}`);
      throw new Error(`Project persistence error: ${message}`);
    }
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

  public setScannerConfig(value: ScannerCFG.Scanner.ScannerConfig) {
    this.metadata.setScannerConfig(value);
  }

  public setScanPath(scanRoot: string) {
    this.metadata.setScanRoot(scanRoot);
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

  public getWorkRoot() {
    return this.metadata.getWorkRoot();
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

  public getApi() {
    return this.metadata.getApi();
  }

  public setToken(token: string) {
    this.metadata.setToken(token);
  }

  public setApiKey(apiKey: string) {
    this.metadata.setApiKey(apiKey);
  }

  public setSourceCodePath(sourceCodePath: string) {
    this.metadata.setSourceCodePath(sourceCodePath);
  }

  public getSourceCodePath() {
    return this.metadata.getSourceCodePath();
  }

  private getProjectAPIKey() {
    return this.metadata.getApiKey();
  }

  /**
   * @brief Retrieves the appropriate API key to be used in SCANOSS services
   * @return Returns the project-specific API key if configured, otherwise falls back to the global API key
   * @details If no project key exists it returns the global API key set.
   * If both keys are unset, returns undefined.
   */
  public getApiKey(): string {
    const { DEFAULT_API_INDEX, APIS } = userSettingService.get();
    return this.getProjectAPIKey() ? this.getProjectAPIKey() : APIS[DEFAULT_API_INDEX].API_KEY;
  }

  public getGlobalApi(): string {
    const { DEFAULT_API_INDEX, APIS } = userSettingService.get();
    return this.getApi() ? this.getApi() : APIS[DEFAULT_API_INDEX].URL;
  }

  public async getResults() {
    return JSON.parse(await fs.promises.readFile(`${this.metadata.getMyPath()}/result.json`, 'utf8'));
  }

  public getTree(): Tree {
    return this.tree;
  }

  public updateTree() {
    this.saveWithSnapshot();
    this.notifyTree();
  }

  public async notifyTree() {
    const tree = await this.tree.getTree();
    broadcastManager.get().send(IpcChannels.TREE_UPDATED, tree);
  }

  public getNode(path: string) {
    return this.tree.getNode(path);
  }

  public getToken() {
    return this.metadata.getToken();
  }

  public async getDependencies(): Promise<IDependencyResponse> {
    try {
      return JSON.parse(await fs.promises.readFile(`${this.metadata.getMyPath()}/dependencies.json`, 'utf8'));
    } catch (e) {
      log.error(e);
      throw e;
    }
  }

  public async setGlobalFilter(filter: IWorkbenchFilter) {
    try {
      if (filter?.path) filter.path += '/';

      if (!(JSON.stringify({ ...filter, path: null }) === JSON.stringify({ ...this.filter, path: null }))) {
        broadcastManager.get().send(IpcChannels.TREE_UPDATING, {});
        this.tree.setTreeViewMode(TreeViewModeCreator.create(filter, this.fileTreeViewMode));
        this.notifyTree();
      }
      this.filter = filter;
      return true;
    } catch (e) {
      log.error(e);
      throw e;
    }
  }

  public getGlobalFilter(): IWorkbenchFilter {
    return this.filter;
  }

  public getFilter(params: IWorkbenchFilterParams): IWorkbenchFilter {
    if (params?.unique) return params.filter;
    return { ...this.filter, ...params?.filter };
  }

  public setFileTreeViewMode(mode: FileTreeViewMode) {
    if (JSON.stringify(this.fileTreeViewMode) === JSON.stringify(mode)) return;
    this.tree.setTreeViewMode(TreeViewModeCreator.create(this.filter, mode));
    this.fileTreeViewMode = mode;
    this.notifyTree();
  }

  public setTree(tree: Tree) {
    this.tree = tree;
    this.hasSnapshotOnDisk = false;
  }
}
