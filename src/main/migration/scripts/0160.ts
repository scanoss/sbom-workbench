import fs from 'fs';
import log from 'electron-log';
import { Tree } from '../../workspace/Tree/Tree/Tree';

function updateRecurTree(root) {
  for (const child of root.children) {
    if (child.type === 'folder') {
      updateRecurTree(child);
      child.updateStatusFlags();
    }
  }
}

export async function flagTreeFolderMigration(projectPath: string) {
  log.info('%c[MIGRATION] IN PROGRESS...', 'color: green');
  const project = JSON.parse(fs.readFileSync(`${projectPath}/tree.json`, 'utf8'));
  const metadata = JSON.parse(fs.readFileSync(`${projectPath}/metadata.json`, 'utf8'));
  const newTree = new Tree(metadata.work_root);
  newTree.loadTree(project.tree.rootFolder);

  updateRecurTree(newTree.getRootFolder());
  project.tree = newTree;

  fs.writeFileSync(`${projectPath}/tree.json`, JSON.stringify(project, null, 2), 'utf8');
}
