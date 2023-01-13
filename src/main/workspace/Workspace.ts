import * as fs from 'fs';
import log from 'electron-log';
import { Sequelize } from 'sequelize-typescript';
import { app } from 'electron';
import path from 'path';
import { Project } from './Project';
import { INewProject, IProject, License, ProjectState } from '../../api/types';
import { License as LicenseModel } from '../model/ORModel/License';
import { ProjectFilter } from './filters/ProjectFilter';
import { modelProvider } from '../services/ModelProvider';
import { toEntity } from '../adapters/modelAdapter'
import { Model } from '../model/Model';
import { Version } from '../model/ORModel/Version';
import { Component } from '../model/ORModel/Component';
import { LicenseVersion } from '../model/ORModel/LicenseVersion';

class Workspace {

  private  readonly  WORKSPACE_MODEL: string = 'workspace.sqlite3';

  private projectList: Array<Project>;

  private wsPath: string;

  constructor() {
    this.projectList = [];
  }

  public async init(workspacePath: string) {
    this.wsPath =  workspacePath;
    this.initWorkspaceFileSystem();
    await this.initWorkspaceModel();
  }

  public async read() {
    log.transports.file.resolvePath = () => `${this.wsPath}/ws.log`;
    // if (this.projectList.length) this.close();  //Prevents to keep projects opened when directory changes
    log.info(`%c[ WORKSPACE ]: Reading projects....`, 'color: green');
    const projectPaths = await this.getAllProjectsPaths();
    const projectArray: Promise<Project>[] = projectPaths.map((projectPath) =>
      Project.readFromPath(projectPath)
        .then((p) => {
          log.info(
            `%c[ WORKSPACE ]: Successfully read project ${projectPath}`,
            'color: green'
          );
          return p;
        })
        .catch((e) => {
          log.info(
            `%c[ WORKSPACE ]: Cannot read project ${projectPath}`,
            'color: green'
          );
          throw e;
        })
    );
    let projectsReaded = (await Promise.allSettled(
      projectArray
    )) as PromiseSettledResult<Project>[];
    projectsReaded = projectsReaded.filter((p) => p.status === 'fulfilled');
    this.projectList = projectsReaded.map(
      (p) => (p as PromiseFulfilledResult<Project>).value
    );
  }

  public getProjectsDtos(): Array<IProject> {
    const projectsDtos: Array<IProject> = this.projectList.map((p) =>
      p.getDto()
    );
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
    for (let i = 0; i < this.projectList.length; i += 1)
      if (this.projectList[i].getProjectName() === projectName) return true;
    return false;
  }

  public async removeProject(p: Project) {
    log.info(
      `%c[ WORKSPACE ]: Removing project ${p.getProjectName()}`,
      'color: green'
    );
    for (let i = 0; i < this.projectList.length; i += 1)
      if (this.projectList[i].getProjectName() === p.getProjectName()) {
        // eslint-disable-next-line no-await-in-loop
        await fs.promises.rmdir(this.projectList[i].getMyPath(), {
          recursive: true,
        });
        this.projectList.splice(i, 1);
        return true;
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
    log.info(
      `%c[ WORKSPACE ]: Opening project ${filter.getParam()}`,
      'color: green'
    );
    await p.upgrade();
    await p.open();
    return p;
  }

  public getMyPath() {
    return this.wsPath;
  }

  public async closeAllProjects() {
    log.info(`%c[ WORKSPACE ]: Closing all opened projects`, 'color: green');
    // eslint-disable-next-line no-restricted-syntax
    for (const p of this.projectList)
      if (p.getState() === ProjectState.OPENED) await p.close();
  }

  public async addProject(p: Project) {
    if (this.existProject(p.getProjectName())) {
      log.info(
        `%c[ WORKSPACE ]: Project already exist and will be replaced`,
        'color: green'
      );
      await this.removeProject(p);
    }
    log.info(
      `%c[ WORKSPACE ]: Adding project ${p.getProjectName()} to workspace`,
      'color: green'
    );
    const pDirectory = `${this.wsPath}/${p.getProjectName()}`;

    if (!fs.existsSync(`${pDirectory}`)) await fs.promises.mkdir(pDirectory);
    const files = await fs.promises.readdir(pDirectory);
    const unlinkPromises = files.map((filename) =>
      fs.promises.unlink(`${pDirectory}/${filename}`)
    );
    await Promise.all(unlinkPromises);

    p.setMyPath(pDirectory);
    p.save();
    this.addNewProject(p);
    return this.projectList.length - 1;
  }

  private initWorkspaceFileSystem() {
    if (!fs.existsSync(`${this.wsPath}`)) fs.mkdirSync(this.wsPath);
  }

  private async initWorkspaceModel(): Promise<void>{
    if (!fs.existsSync(`${this.wsPath}/${this.WORKSPACE_MODEL}`)){
      await new Model().createDb(`${this.wsPath}/${this.WORKSPACE_MODEL}`);
      const sequelize = await this.initORM();
      await sequelize.sync({force: false});
      await this.importGlobalLicenses();
      modelProvider.workspaceModel = sequelize;
      return;
    }
    await this.initORM();
  }

  private async initORM(): Promise<Sequelize> {
    const sequelize = new Sequelize({
      database: this.WORKSPACE_MODEL,
      dialect: 'sqlite',
      logging: false,
      storage: `${this.wsPath}/${this.WORKSPACE_MODEL}`,
    });
    await sequelize.addModels([LicenseModel,Version,Component,LicenseVersion]);
    return sequelize;
  }

  private async importGlobalLicenses() {
      const RESOURCES_PATH = app.isPackaged
        ? path.join(process.resourcesPath, 'assets/data/licenses.json')
        : path.join(__dirname, '../../../assets/data/licenses.json');
      const licenses = await fs.promises.readFile(RESOURCES_PATH, 'utf-8');
      await LicenseModel.bulkCreate(JSON.parse(licenses));
  }

  private async getAllProjectsPaths() {
    const workspaceStuff = await fs.promises
      .readdir(this.wsPath, { withFileTypes: true })
      .catch((e) => {
        log.info(
          `%c[ WORKSPACE ]: Cannot read the workspace directory ${this.wsPath}`,
          'color: green'
        );
        log.error(e);
        throw e;
      });
    const projectsDirEnt = workspaceStuff.filter((dirent) => {
      return !dirent.isSymbolicLink() && !dirent.isFile();
    });
    const projectPaths = projectsDirEnt.map(
      (dirent) => `${this.wsPath}/${dirent.name}`
    );
    return projectPaths;
  }

  public async getLicenses(): Promise<Array<License>> {
    const licenses  = await LicenseModel.findAll();
    return toEntity<Array<License>>(licenses);
  }

  public async createProject(projectDTO: INewProject): Promise<Project> {
    const newProject: Project = new Project(projectDTO.name);
    newProject.setScannerConfig(projectDTO.scannerConfig);
    newProject.setScanPath(projectDTO.scan_root);
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

  public addNewProject(p: Project) {
    if (p) this.projectList.push(p);
  }
}

export const workspace = new Workspace();
