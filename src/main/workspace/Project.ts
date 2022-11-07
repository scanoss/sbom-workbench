/* eslint-disable max-classes-per-file */
import fs from 'fs';
import log from 'electron-log';
import { IDependencyResponse, Scanner } from 'scanoss';
import {
  FileTreeViewMode,
  IProjectCfg,
  IWorkbenchFilter,
  IWorkbenchFilterParams,
  ProjectState,
} from '../../api/types';
import { ScanModel } from '../model/ScanModel';
import { Metadata } from './Metadata';
import { ProjectMigration } from '../migration/ProjectMigration';
import { Tree } from './tree/Tree';
import { modelProvider } from '../services/ModelProvider';
import { TreeViewModeCreator } from './tree/treeViewModes/TreeViewModeCreator';
import { IpcChannels } from '../../api/ipc-channels';
import * as ScannerCFG from '../task/scanner/types';

export class Project {
  work_root: string;

  scan_root: string;

  project_name: string;

  logical_tree: Tree;

  tree: Tree;

  results: any;

  store!: ScanModel;

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

  constructor(name: string) {
    this.metadata = new Metadata(name);
    this.state = ProjectState.CLOSED;
    this.filter = null;
    this.fileTreeViewMode = FileTreeViewMode.DEFAULT;
    this.tree = null;
    this.filesToScan = {};
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
    const pMigration = new ProjectMigration(
      this.metadata.getVersion(),
      this.metadata.getMyPath()
    );
    const newVersion: string = await pMigration.up();
    this.metadata = await Metadata.readFromPath(this.metadata.getMyPath());
    this.metadata.setAppVersion(newVersion);
    this.metadata.save();
  }

  public async open(): Promise<boolean> {
    this.state = ProjectState.OPENED;
    log.transports.file.resolvePath = () =>
      `${this.metadata.getMyPath()}/project.log`;
    const project = await fs.promises.readFile(
      `${this.metadata.getMyPath()}/tree.json`,
      'utf8'
    );
    const a = JSON.parse(project);
    this.filesToScan = a.filesToScan;
    this.filesNotScanned = a.filesNotScanned;
    this.processedFiles = a.processedFiles;
    this.filesSummary = a.filesSummary;
    await modelProvider.init(this.metadata.getMyPath());
    this.metadata = await Metadata.readFromPath(this.metadata.getMyPath());
    this.tree = new Tree(a.tree.rootFolder.label, this.metadata.getMyPath(),a.tree.rootFolder.label);
    this.tree.loadTree(a.tree.rootFolder);
    return true;
  }

  public async close() {
    if (this.scanner && this.scanner.isRunning()) this.scanner.stop();
    log.info(
      `%c[ PROJECT ]: Closing project ${this.metadata.getName()}`,
      'color: green'
    );
    this.state = ProjectState.CLOSED;
    this.scanner = null;
    this.logical_tree = null;
    this.tree = null;
    this.store = null;
    this.filesToScan = null;
    this.filter = null;
  }

  public save(): void {
    this.metadata.save();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const a = {
      filesToScan: self.filesToScan,
      filesNotScanned: self.filesNotScanned,
      processedFiles: self.processedFiles,
      filesSummary: self.filesSummary,
      tree: self.tree,
    };
    fs.writeFileSync(
      `${this.metadata.getMyPath()}/tree.json`,
      JSON.stringify(a)
    );
    log.info(
      `%c[ PROJECT ]: Project ${this.metadata.getName()} saved`,
      'color:green'
    );
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

  public getApi() {
    return this.metadata.getApi();
  }

  public setToken(token: string) {
    this.metadata.setToken(token);
  }

  public setApiKey(apiKey: string) {
    this.metadata.setApiKey(apiKey);
  }

  public getApiKey() {
    return this.metadata.getApiKey();
  }

  public async getResults() {
    return JSON.parse(
      await fs.promises.readFile(
        `${this.metadata.getMyPath()}/result.json`,
        'utf8'
      )
    );
  }

  public getTree(): Tree {
    return this.tree;
  }

  public updateTree() {
    this.save();
    this.notifyTree();
  }

  public async notifyTree() {
    const tree = await this.tree.getTree();
    this.tree.sendToUI(IpcChannels.TREE_UPDATED, tree);
  }

  public getNode(path: string) {
    return this.tree.getNode(path);
  }

  public getToken() {
    return this.metadata.getToken();
  }

  public async getDependencies(): Promise<IDependencyResponse> {
    try {
      return JSON.parse(
        await fs.promises.readFile(
          `${this.metadata.getMyPath()}/dependencies.json`,
          'utf8'
        )
      );
    } catch (e) {
      log.error(e);
      return null;
    }
  }

  public async setGlobalFilter(filter: IWorkbenchFilter) {
    try {
      if (
        !(
          JSON.stringify({ ...filter, path: null }) ===
          JSON.stringify({ ...this.filter, path: null })
        )
      ) {
        this.tree.sendToUI(IpcChannels.TREE_UPDATING, {});
        this.tree.setTreeViewMode(
          TreeViewModeCreator.create(filter, this.fileTreeViewMode)
        );
        this.notifyTree();
      }
      this.filter = filter;
      return true;
    } catch (e) {
      log.error(e);
      return e;
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
    this.metadata.setFileCounter(tree.getSummarize().include);
  }
}
