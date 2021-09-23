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

  ws_path: string;

  constructor() {
    super();
    this.projectList = [];
    // this.name = 'scanoss-workspace';
    // this.ws_path = `${os.homedir()}/${this.name}`;

    // if (!fs.existsSync(`${this.ws_path}`)) fs.mkdirSync(`${this.ws_path}`);

    // if (!fs.existsSync(`${this.ws_path}/defaultCfg.json`)) {
    //   fs.writeFileSync(`${this.ws_path}/defaultCfg.json`, JSON.stringify(defaultCfg, null, 4));
    // }

    // this.projectsListOld = new TreeStructure.ProjectTree('Unnamed');


    // console.log(mt);

    // explora el directorio en busca de metadata.json
    // voy creando un nuevo proyecto con el json metadata new Project(mt:metadata)
    // for(folder)
    //   Metadata.build(pathAlMetadata).then((mt) => {
    //     this.projectList.add(new ProjectTree(mt))
    //  });

    //  for (folder)
    //   mt new MediaMetadata(path)
    //   mt.init()
    //   new ProjectTree(mt)

    //   ProjectList. add (new TreeStructure.ProjectTree(mt));


    // Luego agrego el proyecto creado a la lista de projectos del workspace

    //En el momento que pidan el listado de proyectos, la lista ya esta cargada.
    //pArr = [new ProjectTree({}:metadata ), new ProjectTree(),new ProjectTree()]

    // Cuando la UI selecciona un proyecto, devolveria un id representando
    // el indice del array.


    //IMPORTANTE: hacer tambien una funcion en workspace para cerrar el proyecto i.

  }

  public createFolderIfNotExist() {
    console.log(`[ WORKSPACE ]: `);
    fs.mkdirSync(`${this.ws_path}`);

  }

  private initWorkspaceFileSystem(){

    if (!fs.existsSync(`${this.ws_path}`)) fs.mkdirSync(this.ws_path);

    if (!fs.existsSync(`${this.ws_path}/defaultCfg.json`))
      fs.writeFileSync(`${this.ws_path}/defaultCfg.json`, JSON.stringify(defaultCfg, null, 4));

  }

  public async load(workspacePath: string) {

    this.ws_path = workspacePath;

    this.initWorkspaceFileSystem();

    if (this.projectList.length) {
      console.log(`[ WORKSPACE ]: Closing opened projects`);
      this.projectList = [];
    }

    console.log(`[ WORKSPACE ]: Reading projects....`);
    const projectPaths = await this.getAllProjectsPaths();
    const projectArray: Promise<Project>[] = projectPaths.map((projectPath) => Project.build(projectPath));

    let projectsReaded = (await Promise.allSettled(projectArray).catch((e) => {
      console.log(`Error reading project: ${e.path}`);
    })) as PromiseSettledResult<Project>[];

    projectsReaded = projectsReaded.filter((p) => (p.status === 'fulfilled'));
    this.projectList = projectsReaded.map((p) => (p as PromiseFulfilledResult<Project>).value);








    // await  creo el folder workspace y retorno el wspath default que utilizo


    // this.projectList =  metadataArr.map((mt: Metadata) => {
    //   new Project(mt);
    //    return mt;
    //   });



    // genero una lista de proyectos con su metadata - devuelvo la lista de proyectos
    // return new Workspace(lista de proyectos);
  }

  public addProject(p: Project) {
    this.projectList.push(p);
    return this.projectList.length - 1;
  }



  newProject(scanPath: string, mailbox: any) {
    this.projectsListOld = new Project('Unnamed');
    this.projectsListOld.setMailbox(mailbox);

    // Copy the default workspace configuration to the project folder
    const projectPath = `${this.ws_path}/${path.basename(scanPath)}`;
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
    if (!projectPath.includes(this.ws_path) || !fs.existsSync(projectPath)) {
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

  public async getAllProjectsPaths(){
    const workspaceStuff = await fs.promises.readdir(this.ws_path, { withFileTypes: true });
    const projectsDirEnt = workspaceStuff.filter((dirent) => {return !dirent.isSymbolicLink() && !dirent.isFile();})
    const projectPaths = projectsDirEnt.map((dirent) => `${this.ws_path}/${dirent.name}`);
    return projectPaths;
  }

  public async getAllMetadata() {
    const workspaceStuff = await fs.promises.readdir(this.ws_path, { withFileTypes: true });
    const projectsPaths = workspaceStuff.filter((dirent) => {return !dirent.isSymbolicLink() && !dirent.isFile();})
    const metadataPaths = projectsPaths.map((dirent) => `${this.ws_path}/${dirent.name}/metadata.json`);

    const metadataArray: Promise<Metadata>[] = metadataPaths.map((metadataPath) => Metadata.build(metadataPath));
    const metadata = await Promise.all(metadataArray).catch((e) => {
      console.log(`Error reading metadata: ${e.path}`);
      throw e;
    });

    return metadata;
  }

  async listProjects() {
    const projects: Array<any> = [];
    try {
      const projectPaths = fs
        .readdirSync(this.ws_path, { withFileTypes: true })
        .sort(this.dirFirstFileAfter)
        .filter((dirent) => {
          return !dirent.isSymbolicLink() && !dirent.isFile();
        })
        .map((dirent) => `${this.ws_path}/${dirent.name}/metadata.json`);

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
