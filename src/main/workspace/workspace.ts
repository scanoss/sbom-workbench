/* eslint-disable @typescript-eslint/no-empty-function */
import { EventEmitter } from 'events';
import { stripBasename } from 'history/PathUtils';
import * as fs from 'fs';
import * as Filtering from './filtering';
import * as TreeStructure from './ProjectTree';

/**
 *
 */
// eslint-disable-next-line import/no-mutable-exports
let currentWorkspace: Workspace;

function getUserHome() {
  // Return the value using process.env
  // return process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
}

export class Workspace extends EventEmitter {
  name!: string;

  projectsList: TreeStructure.ProjectTree;

  constructor() {
    super();
    this.projectsList = new TreeStructure.ProjectTree('Unnamed');
    // currentWorkspace = this;
  }

  newProject(scanPath: string,mailbox: any) {
  this.projectsList = new TreeStructure.ProjectTree('Unnamed');
  this.projectsList.setMailbox(mailbox);
  this.projectsList.createScanProject(scanPath);
  }




}

/*
  async getInventoryByID(inv_id: number) {
    const invId = { id: inv_id };
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<any>(async (resolve, reject) => {
      // const db:any = await this.db;

      const results: any = await this.scans_db.inventories.get(invId);
      if (results) resolve(results);
      else reject(new Error('{}'));
    });
  }




  set_filter_file(path: string): boolean {
    this.banned_list.load(path);
    return true;
  }

  prepare_scan() {
    // const i = 0;
    this.directory_tree.build_tree();
    // scanner.prepare...
  }

  */

function includeRoot(original: string, root: string) {
  return `${root}/${original}`;
}
function excludeRoot(complete: string, root: string) {
  return complete.replace(root, '');
}
// eslint-disable-next-line consistent-return

export { currentWorkspace };

function onAddInventory(i: any, any: any) {
  throw new Error('Function not implemented.');
}

/*
const a = new Workspace();
a.set_filter_file('/home/oscar/filters.txt');
// console.log(a.banned_list)
a.set_scan_root('/home/oscar/root');

a.prepare_scan();
// root/folder1/folder21
const arbol = getLeaf(a.directory_tree.project, '/root/folder1/folder21/');
// console.log(arbol)
console.log(a.directory_tree.get_proxy_leaf(arbol));
// a.exclude_file("/root/folder1/folder21", true)
// a.include_file("/root/folder1/folder21/folder31",true)
// console.log(JSON.stringify(a.directory_tree.project)) */
/**
 * Scanner debe recibir un evento de start,y confirmo a UI el evento o error
 * Scanner emite un evento cuando hay uno o mas resultados. Reenviar el evento a UI y
 *
 */
