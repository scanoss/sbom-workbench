/* eslint-disable @typescript-eslint/no-empty-function */
import { EventEmitter } from 'events';
import { stripBasename } from 'history/PathUtils';
import * as fs from 'fs';
import * as Filtering from './filtering';
import * as TreeStructure from './ProjectTree';
import * as os from 'os';

/**
 *
 */
// eslint-disable-next-line import/no-mutable-exports

class Workspace extends EventEmitter {
  name!: string;

  projectsList: TreeStructure.ProjectTree;

  ws_path: string;

  constructor() {
    super();
    this.projectsList = new TreeStructure.ProjectTree('Unnamed');
    this.ws_path = `${os.homedir()}/scanoss-workspace`;
  }

  newProject(scanPath: string, mailbox: any) {
    this.projectsList = new TreeStructure.ProjectTree('Unnamed');
    this.projectsList.setMailbox(mailbox);
    this.projectsList.createScanProject(scanPath);
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
          console.log(`Metadata on project ${projectPath} does not exist. `);
          // TO DO: Create metadata in a project that does not exist.
          //readProject
          //savemetadata
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
