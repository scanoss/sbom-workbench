import fs from 'fs';
import log from 'electron-log';
import sqlite3 from 'sqlite3';
import { Tree } from '../../workspace/Tree/Tree/Tree';
import { NodeStatus } from '../../workspace/Tree/Tree/Node';

export async function treeMigration(projectPath: string) {
  log.info('%c[MIGRATION] IN PROGRESS...', 'color: green');

  const tree = JSON.parse(fs.readFileSync(`${projectPath}/tree.json`, 'utf8'));

  const metadata = JSON.parse(fs.readFileSync(`${projectPath}/metadata.json`, 'utf8'));

  const aux = tree.logical_tree;

  tree.tree = {};
  tree.tree.rootFolder = aux;

  tree.tree.rootName = metadata.name;
  tree.tree.rootpath = metadata.work_root;

  const newTree = new Tree(metadata.work_root);

  newTree.loadTree(tree.tree.rootFolder);

  const results: any = await getResults(projectPath);

  newTree.sync(results);

  tree.tree.rootFolder = newTree.getRootFolder();
  fs.writeFileSync(`${projectPath}/tree.json`, JSON.stringify(tree, null, 2), 'utf8');
}

async function getResults(projectPath) {
  return new Promise((resolve, reject) => {
    const db: any = new sqlite3.Database(`${projectPath}/scan_db`, sqlite3.OPEN_READWRITE, (err: any) => {
      if (err) {
        log.error(err);
      }
      db.run('PRAGMA journal_mode = WAL;');
      db.run('PRAGMA synchronous = OFF');
      db.run('PRAGMA foreign_keys = ON;');
      db.all(
        `SELECT r.idtype,r.file_path as path,r.identified ,r.ignored ,(CASE WHEN  r.identified=0 AND r.ignored=0 THEN 1 ELSE 0 END) as pending FROM results r;`,
        (err: any, results: any) => {
          results.forEach((result) => {
            if (result.idtype === 'none') {
              result[result.path] = NodeStatus.NOMATCH;
              result.status = NodeStatus.NOMATCH;
            } else if (result.identified === 1) {
              result[result.path] = NodeStatus.IDENTIFIED;
              result.status = NodeStatus.IDENTIFIED;
            } else if (result.ignored === 1) {
              result[result.path] = NodeStatus.IGNORED;
              result.status = NodeStatus.IGNORED;
            } else if (result.pending === 1) {
              result[result.path] = NodeStatus.PENDING;
              result.status = NodeStatus.PENDING;
            }
          });
          resolve(results);
        }
      );
    });
  });
}