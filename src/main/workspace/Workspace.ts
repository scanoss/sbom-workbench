/* eslint-disable @typescript-eslint/no-empty-function */
import { EventEmitter } from 'events';
import * as fs from 'fs';
import log from 'electron-log';
import { Project } from './Project';
import { IProject, ProjectState } from '../../api/types';
import { licenses } from '../db/licenses';
 
class Workspace extends EventEmitter {
  private projectList: Array<Project>;

  private wsPath: string;

  constructor() {
    super();
    this.projectList = [];
  }

  public async read(workspacePath: string) {
    this.wsPath = workspacePath;
    await this.initWorkspaceFileSystem();
    log.transports.file.resolvePath = () => `${this.wsPath}/ws.log`;
    // if (this.projectList.length) this.close();  //Prevents to keep projects opened when directory changes
    log.info(`%c[ WORKSPACE ]: Reading projects....`, 'color: green');
    const projectPaths = await this.getAllProjectsPaths();
    const projectArray: Promise<Project>[] = projectPaths.map((projectPath) =>
      Project.readFromPath(projectPath)
        .then((p) => {
          log.info(`%c[ WORKSPACE ]: Successfully read project ${projectPath}`, 'color: green');
          return p;
        })
        .catch((e) => {
          log.info(`%c[ WORKSPACE ]: Cannot read project ${projectPath}`, 'color: green');
          throw e;
        })
    );
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

  public existProject(p: Project) {
    // eslint-disable-next-line no-restricted-syntax
    for (let i = 0; i < this.projectList.length; i += 1)
      if (this.projectList[i].getProjectName() === p.getProjectName()) return i;
    return -1;
  }

  public async removeProject(p: Project) {
    log.info(`%c[ WORKSPACE ]: Removing project ${p.getProjectName()}`, 'color: green');
    for (let i = 0; i < this.projectList.length; i += 1)
      if (this.projectList[i].getProjectName() === p.getProjectName()) {
        // eslint-disable-next-line no-await-in-loop
        await fs.promises.rmdir(this.projectList[i].getMyPath(), { recursive: true });
        this.projectList.splice(i, 1);
        return true;
      }
    return false;
  }

  public async removeProjectByPath(pPath: string) {
    const p = this.getProjectByPath(pPath);
    await this.removeProject(p);
    return true;
  }

  public getProjectByPath(pPath: string): Project {
    for (let i = 0; i < this.projectList.length; i += 1)
      if (this.projectList[i].getMyPath() === pPath) return this.projectList[i];
    return null;
  }

  public getProjectByUuid(uuid: string) {
    for (let i = 0; i < this.projectList.length; i += 1)
      if (this.projectList[i].getUUID() === uuid) return this.projectList[i];
    return null;
  }

  public closeProjectByUuid(uuid: string) {
    // eslint-disable-next-line no-restricted-syntax
    for (const p of this.projectList) {
      if (p.getUUID() === uuid) {
        p.close();
        break;
      }
    }
  }

  public async closeProjectByPath(path: string) {
    // eslint-disable-next-line no-restricted-syntax
    for (const p of this.projectList) {
      if (p.getMyPath() === path) {
        // eslint-disable-next-line no-await-in-loop
        await p.close();
        break;
      }
    }
  }

  public async openProjectByPath(pPath: string) {
    await this.closeAllProjects();

    // eslint-disable-next-line no-restricted-syntax
    const p: Project = this.getProjectByPath(pPath);
    log.info(`%c[ WORKSPACE ]: Opening project ${pPath}`, 'color: green');
    await p.upgrade();
    await p.open();
    return p;
  }

  public resumeProjectByPath(path: string) {
    // eslint-disable-next-line no-restricted-syntax
    for (const p of this.projectList) {
      if (p.getMyPath() === path) {
        p.resume();
        break;
      }
    }
  }

  public getMyPath() {
    return this.wsPath;
  }

  public async closeAllProjects() {
    log.info(`%c[ WORKSPACE ]: Closing all opened projects`, 'color: green');
    // eslint-disable-next-line no-restricted-syntax
    for (const p of this.projectList) if (p.getState() === ProjectState.OPENED) await p.close();
  }

  public async addProject(p: Project) {
    if (this.existProject(p) > -1) {
      log.info(`%c[ WORKSPACE ]: Project already exist and will be replaced`, 'color: green');
      await this.removeProject(p);
    }
    log.info(`%c[ WORKSPACE ]: Adding project ${p.getProjectName()} to workspace`, 'color: green');
    const pDirectory = `${this.wsPath}/${p.getProjectName()}`;

    if (!fs.existsSync(`${pDirectory}`)) await fs.promises.mkdir(pDirectory);
    const files = await fs.promises.readdir(pDirectory);
    const unlinkPromises = files.map((filename) => fs.promises.unlink(`${pDirectory}/${filename}`));
    await Promise.all(unlinkPromises);

    p.setMyPath(pDirectory);
    // p.setConfig(await this.createProjectCfg());
    await p.save();
    this.projectList.push(p);
    return this.projectList.length - 1;
  }

  private async initWorkspaceFileSystem() {
    if (!fs.existsSync(`${this.wsPath}`)) fs.mkdirSync(this.wsPath);
  }

  private async getAllProjectsPaths() {
    const workspaceStuff = await fs.promises.readdir(this.wsPath, { withFileTypes: true }).catch((e) => {
      log.info(`%c[ WORKSPACE ]: Cannot read the workspace directory ${this.wsPath}`, 'color: green');
      console.log(e);
    });
    const projectsDirEnt = workspaceStuff.filter((dirent) => {
      return !dirent.isSymbolicLink() && !dirent.isFile();
    });
    const projectPaths = projectsDirEnt.map((dirent) => `${this.wsPath}/${dirent.name}`);
    return projectPaths;
  }

  public getLicenses(){
    return licenses;
  }

}

export const workspace = new Workspace();
