/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/no-empty-function */
import * as fs from 'fs';
import log from 'electron-log';
import { app, dialog } from 'electron';
import { Project } from './Project';
import { INewProject, IProject, License, ProjectSource, ProjectState } from '../../api/types';
import { licenses } from '../../../assets/data/licenses';
import { ProjectFilter } from './filters/ProjectFilter';
import { userSettingService } from '../services/UserSettingService';
import { modelProvider } from '../services/ModelProvider';
import AppConfig from '../../config/AppConfigModule';
import path from 'path';
import os from 'os';

export class Workspace {
  private projectList: Array<Project>;

  private wsPath: string;

  private readonly DIALOG_RESPONSES = {
    EXIT: 0,
    SWITCH_TO_DEFAULT: 1,
    CREATE_OR_RETRY: 2,
    TRY_AGAIN: 3,
  } as const;

  constructor() {
    this.projectList = [];
  }

  public async read(workspacePath: string) {
    this.wsPath = workspacePath;

    await this.initWorkspaceFileSystem();
    await modelProvider.initWorkspaceModel(this.wsPath);

    log.transports.file.resolvePath = () => `${this.wsPath}/ws.log`;
    // if (this.projectList.length) this.close();  //Prevents to keep projects opened when directory changes
    log.info('%c[ WORKSPACE ]: Reading projects....', 'color: green');
    const projectPaths = await this.getAllProjectsPaths();
    const projectArray: Promise<Project>[] = projectPaths.map((projectPath) => Project.readFromPath(projectPath)
      .then((p) => {
        log.info(`%c[ WORKSPACE ]: Successfully read project ${projectPath}`, 'color: green');
        return p;
      })
      .catch((e) => {
        log.info(`%c[ WORKSPACE ]: Cannot read project ${projectPath}`, 'color: green');
        throw e;
      }));
    let projectsReaded = (await Promise.allSettled(projectArray)) as PromiseSettledResult<Project>[];
    projectsReaded = projectsReaded.filter((p) => p.status === 'fulfilled');
    this.projectList = projectsReaded.map((p) => (p as PromiseFulfilledResult<Project>).value);
  }

  public getProjectsDtos(): Array<IProject> {
    const projectsDtos: Array<IProject> = this.projectList.map((p) => p.getDto());
    return projectsDtos;
  }

  public getOpenedProjects(): Array<Project> {
    const openedProjects: Array<Project> = new Array<Project>();
    // eslint-disable-next-line no-restricted-syntax
    for (const p of this.projectList) {
      if (p.getState() === ProjectState.OPENED) openedProjects.push(p);
    }
    return openedProjects;
  }

  public getOpenProject(): Project {
    return this.getOpenedProjects()[0];
  }

  public existProject(projectName: string): boolean {
    // eslint-disable-next-line no-restricted-syntax
    for (let i = 0; i < this.projectList.length; i += 1) if (this.projectList[i].getProjectName() === projectName) return true;
    return false;
  }

  public async removeProject(p: Project) {
    log.info(`%c[ WORKSPACE ]: Removing project ${p.getProjectName()}`, 'color: green');
    for (let i = 0; i < this.projectList.length; i += 1) {
      if (this.projectList[i].getProjectName() === p.getProjectName()) {
        // eslint-disable-next-line no-await-in-loop
        await fs.promises.rm(this.projectList[i].getMyPath(), {
          recursive: true,
        });
        this.projectList.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  public async removeProjectFilter(filter: ProjectFilter) {
    const p = this.getProject(filter);
    await this.removeProject(p);
    return true;
  }

  public async closeProject(filter: ProjectFilter) {
    const p: Project = this.getProject(filter);
    await p.close();
  }

  public async openProject(filter: ProjectFilter) {
    await this.closeAllProjects();

    // eslint-disable-next-line no-restricted-syntax
    const p: Project = this.getProject(filter);
    log.info(`%c[ WORKSPACE ]: Opening project ${filter.getParam()}`, 'color: green');
    await p.upgrade();
    await p.open();
    return p;
  }

  public getMyPath() {
    return this.wsPath;
  }

  public async closeAllProjects() {
    log.info('%c[ WORKSPACE ]: Closing all opened projects', 'color: green');
    // eslint-disable-next-line no-restricted-syntax
    for (const p of this.projectList) if (p.getState() === ProjectState.OPENED) await p.close();
  }

  public async addProject(p: Project) {
    if (this.existProject(p.getProjectName())) {
      log.info('%c[ WORKSPACE ]: Project already exist and will be replaced', 'color: green');
      await this.removeProject(p);
    }
    log.info(`%c[ WORKSPACE ]: Adding project ${p.getProjectName()} to workspace`, 'color: green');
    const pDirectory = `${this.wsPath}/${p.getProjectName()}`;

    if (!fs.existsSync(`${pDirectory}`)) await fs.promises.mkdir(pDirectory);
    const files = await fs.promises.readdir(pDirectory);
    const unlinkPromises = files.map((filename) => fs.promises.unlink(`${pDirectory}/${filename}`));
    await Promise.all(unlinkPromises);

    p.setMyPath(p.getProjectName());
    p.save();
    this.addNewProject(p);
    return this.projectList.length - 1;
  }

  private async switchToDefaultWorkspace() {
    this.wsPath = this.getDefaultWorkspacePath();
    const userSettings = userSettingService.get();
    userSettings.DEFAULT_WORKSPACE_INDEX = 0;
    userSettingService.set(userSettings);
    await userSettingService.save();
  }

  private getDefaultWorkspacePath(){
    return path.join(os.homedir(), AppConfig.DEFAULT_WORKSPACE_NAME);
  }

  private async handleMissingWorkspace(): Promise<void> {
    const { response } = await dialog.showMessageBox(null, {
      type: 'question',
      buttons: ['Exit', 'Switch to default workspace', 'Create workspace folder', 'Try Again'],
      defaultId: 1,
      cancelId: 0,
      message: `The selected workspace folder "${this.wsPath}" doesn't exist. What would you like to do?`,
      title: 'Workspace Folder Not Found',
    });

    switch (response) {
      case this.DIALOG_RESPONSES.EXIT:
        app.exit(0);
        break;
      case this.DIALOG_RESPONSES.SWITCH_TO_DEFAULT:
        await this.switchToDefaultWorkspace();
        await this.initWorkspaceFileSystem();
        break;
      case this.DIALOG_RESPONSES.CREATE_OR_RETRY:
        fs.mkdirSync(this.wsPath, { recursive: true });
        break;
      case this.DIALOG_RESPONSES.TRY_AGAIN:
        await this.initWorkspaceFileSystem();
        break;
      default:
        await this.initWorkspaceFileSystem();
    }
  }

  private async verifyWorkspaceAccess(): Promise<void> {
    try {
      await fs.promises.access(
        this.getMyPath(),
        fs.constants.R_OK | fs.constants.W_OK | fs.constants.X_OK
      );
    } catch (e: any) {
      log.error('Workspace access error:', e);
      await this.handleAccessError(e);
    }
  }

  private async handleAccessError(error: Error): Promise<void> {
    const { response } = await dialog.showMessageBox(null, {
      buttons: ['Exit', 'Switch to default workspace', 'Try again'],
      defaultId: 1,
      cancelId: 0,
      message: `Could not access the workspace folder "${this.wsPath}". ${error.message}`,
      title: 'Workspace Folder Access Error',
    });

    switch (response) {
      case this.DIALOG_RESPONSES.EXIT:
        app.exit(0);
        break;
      case this.DIALOG_RESPONSES.SWITCH_TO_DEFAULT:
        await this.switchToDefaultWorkspace();
        await this.initWorkspaceFileSystem();
        break;
      case this.DIALOG_RESPONSES.CREATE_OR_RETRY:
        await this.initWorkspaceFileSystem();
        break;
    }
  }

  private async initWorkspaceFileSystem(): Promise<void> {
    const workspaceExists = fs.existsSync(this.wsPath);
    const isDefaultWorkspace = this.wsPath === this.getDefaultWorkspacePath();

    if (!workspaceExists) {
      if (isDefaultWorkspace) {
        fs.mkdirSync(this.wsPath, { recursive: true });
      } else {
        await this.handleMissingWorkspace();
      }
    }
    await this.verifyWorkspaceAccess();
  }

  private async getAllProjectsPaths() {
    const workspaceStuff = await fs.promises.readdir(this.wsPath, { withFileTypes: true }).catch((e) => {
      log.info(`%c[ WORKSPACE ]: Cannot read the workspace directory ${this.wsPath}`, 'color: green');
      log.error(e);
      throw e;
    });
    const projectsDirEnt = workspaceStuff.filter((dirent) => !dirent.isSymbolicLink() && !dirent.isFile());
    const projectPaths = projectsDirEnt.map((dirent) => `${this.wsPath}/${dirent.name}`);
    return projectPaths;
  }

  public getLicenses(): Array<License> {
    return licenses;
  }

  public async createProject(projectDTO: INewProject): Promise<Project> {
    const newProject: Project = new Project(projectDTO.name);
    newProject.setScannerConfig(projectDTO.scannerConfig);
    newProject.setScanPath(projectDTO.scan_root);
    newProject.setSourceCodePath(projectDTO.sourceCodePath);
    newProject.setLicense(projectDTO.default_license);
    if (projectDTO.api) {
      newProject.setApi(projectDTO.api);
      newProject.setApiKey(projectDTO.api_key ? projectDTO.api_key : '');
    }
    if (projectDTO.token) newProject.setToken(projectDTO.token);
    await this.addProject(newProject);
    return newProject;
  }

  public getProject(filter: ProjectFilter) {
    for (const project of this.projectList) {
      if (filter.isValid(project)) return project;
    }
    return null;
  }

  public getProjects() {
    return this.projectList;
  }

  public setProjectList(projects: Array<Project>) {
    this.projectList = projects;
  }

  public addNewProject(p: Project) {
    if (p) this.projectList.push(p);
  }
}

export const workspace = new Workspace();
