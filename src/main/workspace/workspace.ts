/* eslint-disable @typescript-eslint/no-empty-function */
import { EventEmitter } from 'events';
import { stripBasename } from 'history/PathUtils';
import * as fs from 'fs';
import path from 'path';
import { Metadata } from './Metadata';
import { Project } from './Project';

import * as os from 'os';
import * as Filtering from './filtering';
import * as TreeStructure from './Project';
import { IProject } from '../../api/types';

/**
 *
 */
// eslint-disable-next-line import/no-mutable-exports
const defaultCfg = {
  DEFAULT_URL_API: 0,
  AVAILABLE_URL_API: ['https://osskb.org/api/scan/direct'],
  SCAN_MODE: 'FULL_SCAN',
};

class Workspace extends EventEmitter {
  private name: string;

  metadataList: Array<Metadata>;

  projectList: Array<Project>;

  projectsListOld: Project;

  wsPath: string;

  constructor() {
    super();
    this.projectList = [];
  }

  public async load(workspacePath: string) {
    if (this.projectList.length) this.close();  //Prevents to keep projects opened when directory changes
    this.wsPath = workspacePath;
    this.initWorkspaceFileSystem();
    console.log(`[ WORKSPACE ]: Reading projects....`);
    const projectPaths = await this.getAllProjectsPaths();
    const projectArray: Promise<Project>[] = projectPaths.map((projectPath) => Project.readFromPath(projectPath));
    let projectsReaded = ((await Promise.allSettled(projectArray)) as PromiseSettledResult<Project>[]);
    projectsReaded = projectsReaded.filter((p) => p.status === 'fulfilled');
    this.projectList = projectsReaded.map((p) => (p as PromiseFulfilledResult<Project>).value);
  }

  public getProjectsDtos(): Array<IProject> {
    const projectsDtos: Array<IProject> = this.projectList.map((p) => p.getDto());
    return projectsDtos;
  }

  public loadProjectByPath(path: string) {
    // eslint-disable-next-line no-restricted-syntax
    for (const p of this.projectList) {
      if (p.myPath === path) {
        p.load();
        break;
      }
    }
  }

  public closeAllProjects() {
    for (const p of this.projectList) p.close();

  }

  public getMyPath() {
    return this.wsPath;
  }

  public close() {
    console.log(`[ WORKSPACE ]: Closing opened projects`);
    this.projectList = [];
  }

  public async addProject(p: Project) {
    const pName: string = p.getDto().name;
    const pDirectory = `${this.wsPath}/${pName}`;
    await fs.promises.mkdir(pDirectory);
    p.setMyPath(pDirectory);
    await p.save();
    this.projectList.push(p);

    return this.projectList.length - 1;
  }

  private initWorkspaceFileSystem() {
    if (!fs.existsSync(`${this.wsPath}`)) fs.mkdirSync(this.wsPath);
    if (!fs.existsSync(`${this.wsPath}/defaultCfg.json`))
      fs.writeFileSync(`${this.wsPath}/defaultCfg.json`, JSON.stringify(defaultCfg, null, 4));
  }

  private async getAllProjectsPaths(){
    const workspaceStuff = await fs.promises.readdir(this.wsPath, { withFileTypes: true });
    const projectsDirEnt = workspaceStuff.filter((dirent) => {return !dirent.isSymbolicLink() && !dirent.isFile();})
    const projectPaths = projectsDirEnt.map((dirent) => `${this.wsPath}/${dirent.name}`);
    return projectPaths;
  }





  newProject(scanPath: string, mailbox: any) {
    this.projectsListOld = new Project('Unnamed');
    this.projectsListOld.setMailbox(mailbox);

    // Copy the default workspace configuration to the project folder
    const projectPath = `${this.wsPath}/${path.basename(scanPath)}`;
    const projectCfgPath = `${projectPath}/projectCfg.json`;
    if (!fs.existsSync(projectPath)) fs.mkdirSync(`${projectPath}`);
    if (!fs.existsSync(`${projectCfgPath}`)) {
      const projectCfg = {
        DEFAULT_URL_API: defaultCfg.AVAILABLE_URL_API[defaultCfg.DEFAULT_URL_API],
        SCAN_MODE: defaultCfg.SCAN_MODE,
      };
      const projectCfgStr = JSON.stringify(projectCfg, null, 4);
      fs.writeFileSync(projectCfgPath, projectCfgStr);
    }

    this.projectsListOld.createScanProject(scanPath);


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
