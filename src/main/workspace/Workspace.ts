/* eslint-disable @typescript-eslint/no-empty-function */
import { EventEmitter } from 'events';
import * as fs from 'fs';
import { Project } from './Project';
import { IProject, ProjectState } from '../../api/types';

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
    // if (this.projectList.length) this.close();  //Prevents to keep projects opened when directory changes
    console.log(`[ WORKSPACE ]: Reading projects....`);
    const projectPaths = await this.getAllProjectsPaths();
    const projectArray: Promise<Project>[] = projectPaths.map((projectPath) =>
      Project.readFromPath(projectPath)
        .then((p) => {
          console.log(`[ WORKSPACE ]: Successfully read project ${projectPath}`);
          return p;
        })
        .catch((e) => {
          console.log(`[ WORKSPACE ]: Cannot read project ${projectPath}`);
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
    console.log(`[ WORKSPACE ]: Removing project ${p.getProjectName()}`);
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
    p.upgrade();
    console.log(`[ WORKSPACE ]: Opening project ${pPath}`);
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
    console.log(`[ WORKSPACE ]: Closing all opened projects`);
    // eslint-disable-next-line no-restricted-syntax
    for (const p of this.projectList) if (p.getState() === ProjectState.OPENED) await p.close();
  }

  public async addProject(p: Project) {
    if (this.existProject(p) > -1) {
      console.log(`[ WORKSPACE ]: Project already exist and will be replaced`);
      await this.removeProject(p);
    }
    console.log(`[ WORKSPACE ]: Adding project ${p.getProjectName()} to workspace`);
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
      console.log(`[ WORKSPACE ]: Cannot read the workspace directory ${this.wsPath}`);
      console.log(e);
    });
    const projectsDirEnt = workspaceStuff.filter((dirent) => {
      return !dirent.isSymbolicLink() && !dirent.isFile();
    });
    const projectPaths = projectsDirEnt.map((dirent) => `${this.wsPath}/${dirent.name}`);
    return projectPaths;
  }

}

export const workspace = new Workspace();
