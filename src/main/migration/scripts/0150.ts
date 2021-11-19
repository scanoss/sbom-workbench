import fs from 'fs';
import log from 'electron-log';

export function treeMigration(projectPath: string) {
    log.info('%c[MIGRATION] IN PROGRESS...', 'color: green');
  const tree = JSON.parse(fs.readFileSync(`${projectPath}/tree.json`, 'utf8'));

  const metadata = JSON.parse(fs.readFileSync(`${projectPath}/metadata.json`, 'utf8'));

  const aux = tree.logical_tree;

  tree.tree = {};
  tree.tree.rootFolder = aux;

  tree.tree.rootName = metadata.name;
  tree.tree.rootpath = metadata.work_root;

  fs.writeFileSync(`${projectPath}/tree.json`, JSON.stringify(tree, null, 2), 'utf8');
}
