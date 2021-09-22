/* eslint-disable @typescript-eslint/no-empty-function */
import { EventEmitter } from 'events';
import { stripBasename } from 'history/PathUtils';
import * as fs from 'fs';
import path from 'path';

import * as os from 'os';
import * as Filtering from './filtering';
import * as TreeStructure from './ProjectTree';

/**
 *
 */
// eslint-disable-next-line import/no-mutable-exports
const defaultCfg = {
  DEFAULT_URL_API: 0,
  AVAILABLE_URL_API: ['https://osskb.org/api/scan/direct'],
  SCAN_MODE: 'FULL_SCAN',
  TOKEN: ''
};

class Workspace extends EventEmitter {
  private name: string;

  projectsList: TreeStructure.ProjectTree;

  ws_path: string;

  constructor() {
    super();
    this.name = 'scanoss-workspace';
    this.ws_path = `${os.homedir()}/${this.name}`;

    if (!fs.existsSync(`${this.ws_path}`)) fs.mkdirSync(`${this.ws_path}`);

    if (!fs.existsSync(`${this.ws_path}/defaultCfg.json`)) {
      fs.writeFileSync(`${this.ws_path}/defaultCfg.json`, JSON.stringify(defaultCfg, null, 4));
    }

    this.projectsList = new TreeStructure.ProjectTree('Unnamed');
  }

  newProject(scanPath: string, mailbox: any) {
    this.projectsList = new TreeStructure.ProjectTree('Unnamed');
    this.projectsList.setMailbox(mailbox);

    // Copy the default workspace configuration to the project folder
    const projectPath = `${this.ws_path}/${path.basename(scanPath)}`;
    const projectCfgPath = `${projectPath}/projectCfg.json`;
    if (!fs.existsSync(projectPath)) fs.mkdirSync(`${projectPath}`);
    if (!fs.existsSync(`${projectCfgPath}`)) {
      const projectCfg = {
        DEFAULT_URL_API: defaultCfg.AVAILABLE_URL_API[defaultCfg.DEFAULT_URL_API],
        SCAN_MODE: defaultCfg.SCAN_MODE,
        TOKEN: defaultCfg.TOKEN,
      };
      const projectCfgStr = JSON.stringify(projectCfg, null, 4);
      fs.writeFileSync(projectCfgPath, projectCfgStr);
    }

    this.projectsList.createScanProject(scanPath);


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

  async listProjects() {
    const projects: Array<any> = [];
    try {
      const projectPaths = fs
        .readdirSync(this.ws_path, { withFileTypes: true })
        .sort(this.dirFirstFileAfter)
        .filter((dirent) => {
          return !dirent.isSymbolicLink() && !dirent.isFile();
        })
        .map((dirent) => `${this.ws_path}/${dirent.name}`);

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
