/* eslint-disable @typescript-eslint/no-empty-function */
import { EventEmitter } from 'events';
import { stripBasename } from 'history/PathUtils';
import * as fs from 'fs';
import path from 'path';
import { Metadata } from './Metadata';
import { Project } from './Project';
import { IProject, IProjectCfg, IWorkspaceCfg, ProjectState } from '../../api/types';
import { WorkspaceFileModel } from './workspaceModel/WorkspaceFileModel';
import { IWorkspaceModel } from './workspaceModel/IWorkspaceModel';

/**
 *
 */
// eslint-disable-next-line import/no-mutable-exports
const DEFAULT_WORKSPACE_CONFIG: IWorkspaceCfg = {
  DEFAULT_URL_API: 0,
  AVAILABLE_URL_API: ['https://osskb.org/api/scan/direct'],
  SCAN_MODE: 'FULL_SCAN',
  TOKEN: '',
};

class Workspace extends EventEmitter {
  projectList: Array<Project>;

  workspaceModel: IWorkspaceModel;

  wsPath: string;

  workspaceConfig: IWorkspaceCfg;

  constructor() {
    super();
    this.projectList = [];
    this.workspaceModel = new WorkspaceFileModel();
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
    for (const p of this.projectList) if (p.getState() === ProjectState.OPENED) openedProjects.push(p);
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
    console.log(`[ WORKSPACE ]: Opening project ${pPath}`);
    // eslint-disable-next-line no-restricted-syntax
    const p: Project = this.getProjectByPath(pPath);
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
    await fs.promises.mkdir(pDirectory);
    p.setMyPath(pDirectory);
    p.setConfig(await this.createProjectCfg());
    await p.save();
    this.projectList.push(p);
    return this.projectList.length - 1;
  }

  private mergeWsCfgToPjCfg(workspace: IWorkspaceCfg): IProjectCfg {
    const projectCfg: IProjectCfg = {
      DEFAULT_URL_API: workspace.AVAILABLE_URL_API[workspace.DEFAULT_URL_API],
      TOKEN: workspace.TOKEN,
      SCAN_MODE: workspace.SCAN_MODE,
    };
    return projectCfg;
  }

  private async createProjectCfg(): Promise<IProjectCfg> {
    try {
      const cfg = await this.workspaceModel.getWSConfig(this.wsPath);
      const cfgWorkspace: IWorkspaceCfg = JSON.parse(cfg);
      if (cfgWorkspace.AVAILABLE_URL_API.length > 0 && cfgWorkspace.DEFAULT_URL_API >= 0)
        return this.mergeWsCfgToPjCfg(cfgWorkspace);
    } catch (e) {
      return this.mergeWsCfgToPjCfg(this.workspaceConfig);
    }
    return this.mergeWsCfgToPjCfg(this.workspaceConfig);
  }

  private async initWorkspaceFileSystem() {
    if (!fs.existsSync(`${this.wsPath}`)) fs.mkdirSync(this.wsPath);
    this.workspaceConfig = DEFAULT_WORKSPACE_CONFIG;
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

  deleteProject(projectPath: string) {
    if (!projectPath.includes(this.wsPath) || !fs.existsSync(projectPath)) {
      throw new Error('Project does not exist');
    }
    this.deleteFolderRecursive(projectPath);
  }

  private deleteFolderRecursive(directoryPath) {
    if (fs.existsSync(directoryPath)) {
      fs.readdirSync(directoryPath).forEach((file, index) => {
        const curPath = path.join(directoryPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          // recurse
          this.deleteFolderRecursive(curPath);
        } else {
          // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(directoryPath);
    }
  }

  dirFirstFileAfter(a, b) {
    if (!a.isDirectory() && b.isDirectory()) return 1;
    if (a.isDirectory() && !b.isDirectory()) return -1;
    return 0;
  }

  async listProjects() {
    const projects: Array<any> = [];
    try {
      const projectPaths = fs
        .readdirSync(this.wsPath, { withFileTypes: true })
        .sort(this.dirFirstFileAfter)
        .filter((dirent) => {
          return !dirent.isSymbolicLink() && !dirent.isFile();
        })
        .map((dirent) => `${this.wsPath}/${dirent.name}/metadata.json`);

      // eslint-disable-next-line no-restricted-syntax
      for (const projectPath of projectPaths) {
        const metadataPath = `${projectPath}/metadata.json`;

        if (fs.existsSync(metadataPath)) {
          const metadataAsText = fs.readFileSync(metadataPath, 'utf8');
          const metadata = JSON.parse(metadataAsText);
          projects.push(metadata);
        } else {
          console.log(`Cannot load project ${projectPath} because it was scanned with an older version of Scannos-DT`);
          // TO DO: Create metadata in a project that does not exist.
          // readProject
          // savemetadata
        }
      }

      return projects;
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  public async getWSConfig(): Promise<IWorkspaceCfg> {
    try {
      const wsConf: IWorkspaceCfg = await this.workspaceModel.getWSConfig(this.wsPath);
      return wsConf;
    } catch (e) {
      return null;
    }
  }

  public async setWSConfig(config: Partial<IWorkspaceCfg>) {
    try {
      if (await this.workspaceModel.setWSConfig(this.wsPath, config)) return config;
      throw new Error('Unable to write config file');
    } catch (e) {
      return new Error('Workspace config was not set successfully');
    }
  }
}

function includeRoot(original: string, root: string) {
  return `${root}/${original}`;
}
function excludeRoot(complete: string, root: string) {
  return complete.replace(root, '');
}
// eslint-disable-next-line consistent-return

function onAddInventory(i: any, any: any) {
  throw new Error('Function not implemented.');
}

export const workspace = new Workspace();
