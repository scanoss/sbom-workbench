/* eslint-disable @typescript-eslint/no-empty-function */
import { EventEmitter } from 'events';
import { stripBasename } from 'history/PathUtils';
import * as fs from 'fs';
import * as Filtering from './filtering';
import * as Project from './directorytree';
// import { inventoryService } from '../../../../api/inventory-service';

// import * as DB from "scanoss_db.js"
// import Components from "scanoss_db";
// import * as Emitter from (EventEmitter)
// import * as Components from './component_db'

import { ScanDb } from '../db/scan_db';
import { Inventory } from '../../api/types';
// const { EventEmitter } = require('events');
// const Components = require('./scan_db');
/**
 *
 */
// eslint-disable-next-line import/no-mutable-exports
let defaultWorkspace: Workspace;

export class Workspace extends EventEmitter {
  work_path: string | undefined;

  name!: string;

  banned_list: Filtering.BannedList;

  directory_tree: Project.ProjectTree;

  scans_db: ScanDb;

  constructor() {
    super();
    this.directory_tree = new Project.ProjectTree('Unnamed');
    this.banned_list = new Filtering.BannedList('NoFilter');
    this.directory_tree.on('treeBuilt', (msg: any) => {
      console.log('Tree was built');
      // console.log(JSON.stringify(msg));
    });
    defaultWorkspace = this;

    /* this.scans_db = new ScanDb('/home/oscar/test');
    this.on('createDB', async (i: any) => {
      const init = await this.scans_db.init();
      console.log(`base abierta ${init}`);
    });*/
    //this.emit('createDB');
  }

  async onAddInventory(i: any) {}

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

  set_work_path(path: string) {
    this.work_path = path;
  }

  set_scan_root(path: string) {
    this.directory_tree.set_project_root(path);
  }

  attachInventory(inv: Inventory) {
    let i: number;
    let files: string[];
    files = inv.files;
    for (i = 0; i < inv.files.length; i += 1) {
      // console.log(files);
      insertInventory(this.directory_tree.project, files[i], inv);
      insertComponent(this.directory_tree.project, files[i], inv.purl);
    }
    console.clear();
    fs.writeFileSync(
      '/home/oscar/test/output.json',
      JSON.stringify(this.directory_tree.project).toString()
    );
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

  exclude_file(path: string, recursive: boolean) {
    const a = getLeaf(this.directory_tree.project, path);
    setUseFile(a, false, recursive);
  }

  include_file(path: string, recursive: boolean) {
    const a = getLeaf(this.directory_tree.project, path);
    setUseFile(a, true, recursive);
  }
}

function setUseFile(tree: any, action: boolean, recursive: boolean) {
  if (tree.type === 'file') tree.include = action;
  else {
    let j = 0;
    tree.include = action;
    if (recursive)
      for (j = 0; j < tree.childs.length; j += 1) {
        setUseFile(tree.childs[j], action, recursive);
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
function getLeaf(arbol: any, mypath: string): any {
  let res: string[];
  // eslint-disable-next-line prefer-const
  res = mypath.split('/');
  if (res[0] === '') res.shift();
  if (res[res.length - 1] === '') res.pop();

  if (arbol.name === res[0] && res.length === 1) {
    return arbol;
  }
  const i = 0;
  let j = 0;
  if (arbol.type === 'folder') {
    for (j = 0; j < arbol.childs.length; j += 1) {
      if (
        arbol.childs[j].type === 'folder' &&
        arbol.childs[j].name === res[1]
      ) {
        const newpath = mypath.replace(`${res[0]}/`, '');
        return getLeaf(arbol.childs[j], newpath);
      }
      if (arbol.childs[j].type === 'file' && arbol.childs[j].name === res[1]) {
        return arbol.childs[j];
      }
    }
  }
}

function insertInventory(tree: any, mypath: string, inv: Inventory): any {
  let myPathFolders: string[];
  // eslint-disable-next-line prefer-const
  let arbol = tree;
  console.log(tree);
  myPathFolders = mypath.split('/');
  if (myPathFolders[0] === '') myPathFolders.shift();
  let i: number;
  i = 0;

  while (i < myPathFolders.length) {
    let j: number;
    if (!arbol.inventories.includes(inv.id)) arbol.inventories.push(inv.id);
    // console.log(`busco ${myPathFolders[i]}`);
    for (j = 0; j < arbol.childs.length; j += 1) {
      if (arbol.childs[j].name === myPathFolders[i]) {
        arbol = arbol.childs[j];
        i += 1;
        break;
      }
    }
  }

  arbol.inventories.push(inv.id);
  // console.log(arbol);
}

function insertComponent(tree: any, mypath: string, purl: string): any {
  let myPathFolders: string[];
  // eslint-disable-next-line prefer-const
  let arbol = tree;
  console.log(tree);
  myPathFolders = mypath.split('/');
  if (myPathFolders[0] === '') myPathFolders.shift();
  let i: number;
  i = 0;

  while (i < myPathFolders.length) {
    let j: number;
    if (!arbol.components.includes(purl)) arbol.components.push(purl);
    // console.log(`busco ${myPathFolders[i]}`);
    for (j = 0; j < arbol.childs.length; j += 1) {
      if (arbol.childs[j].name === myPathFolders[i]) {
        arbol = arbol.childs[j];
        i += 1;
        break;
      }
    }
  }

  arbol.components.push(purl);
  // console.log(arbol);
}

function recurseJSON(jsonScan: any, banned_list: Filtering.BannedList): any {
  let i = 0;
  if (jsonScan.type === 'file') {
    if (banned_list.evaluate(jsonScan.path)) {
      jsonScan.action = 'scan';
    } else {
      jsonScan.action = 'filter';
    }
  } else if (jsonScan.type === 'folder') {
    for (i = 0; i < jsonScan.childs.length; i += 1)
      recurseJSON(jsonScan.childs[i], banned_list);
  }
}
export { defaultWorkspace };

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
