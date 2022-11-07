import sqlite3 from 'sqlite3';
import { Querys } from '../../model/querys_db';
import log from 'electron-log';
import fs from 'fs';
import { dependencyService } from '../../services/DependencyService';
import { projectService } from '../../services/ProjectService';
import { workspace } from '../../workspace/Workspace';
import { ProjectFilter } from '../../workspace/filters/ProjectFilter';
import { ProjectFilterPath } from '../../workspace/filters/ProjectFilterPath';
import { dependencyHelper } from '../../helpers/DependencyHelper';
import { fileHelper } from '../../helpers/FileHelper';
import { modelProvider } from '../../services/ModelProvider';
import { Tree } from '../../workspace/tree/Tree';
import { NodeStatus } from '../../workspace/tree/Node';

export async function migration0230(projectPath: string): Promise<void> {
  log.info('Migration 0230 In progress...');
  await modelProvider.init(projectPath);
  await regenerateDependencyTable(projectPath);
  await addDependencies(projectPath);
}

async function regenerateDependencyTable(projectPath): Promise<void> {
  const query = new Querys();
  return new Promise((resolve, reject) => {
    try {
      const db: any = new sqlite3.Database(
        `${projectPath}/scan_db`,
        sqlite3.OPEN_READWRITE,
        (err: any) => {
          if (err) log.error(err);
          db.run('DROP TABLE IF EXISTS dependencies;');
          db.run(query.DEPENDENCY_TABLE);
          resolve();
        }
      );
    } catch (e) {
      reject(e);
    }
  });
}

async function addDependencies(projectPath: string) {
  try {
    const depPath = `${projectPath}/dependencies.json`;
    const exist = await fileHelper.fileExist(depPath);
    if (exist) {
      const dependencies: any = JSON.parse(
        await fs.promises.readFile(`${depPath}`, 'utf8')
      );
      await updateDependenciesOnTree(projectPath, dependencies);
      await updateFlagsOnTree(projectPath);
      // import dependencies on DB
      await dependencyService.insert(dependencies);
    }
  } catch (e) {
    log.error(e);
  }
}

async function updateFlagsOnTree(projectPath: string) {
  const project = await fs.promises.readFile(
    `${projectPath}/tree.json`,
    'utf8'
  );
  const a = JSON.parse(project);
  const m = await fs.promises.readFile(`${projectPath}/metadata.json`, 'utf8');
  const metadata = JSON.parse(m);
  const tree = new Tree(metadata.name, projectPath,metadata.scan_root);
  tree.loadTree(a.tree.rootFolder);
  const rootFolder = tree.getRootFolder();
  addProgressFlags(rootFolder);
  a.tree = tree;
  await fs.promises.writeFile(`${projectPath}/tree.json`, JSON.stringify(a));
}

async function updateDependenciesOnTree(projectPath: string, dependencies) {
  const project = await fs.promises.readFile(
    `${projectPath}/tree.json`,
    'utf8'
  );
  const a = JSON.parse(project);
  const m = await fs.promises.readFile(`${projectPath}/metadata.json`, 'utf8');
  const metadata = JSON.parse(m);
  const tree = new Tree(metadata.name, projectPath,metadata.scan_root);
  tree.loadTree(a.tree.rootFolder);
  tree.addDependencies(dependencies);
  a.tree = tree;
  await fs.promises.writeFile(`${projectPath}/tree.json`, JSON.stringify(a));
}

function addProgressFlags(node) {
  if (node.type == 'folder') {
    node.hasIdentifiedProgress = false;
    node.hasPendingProgress = false;
    node.hasIgnoredProgress = false;
    node.hasPending = false;
    node.hasIdentified = false;
    node.hasIgnored = false;
    node.hasNoMatch = false;
    node.hasFiltered = false;

    for (const child of node.getChildren()) {
      addProgressFlags(child);
      const status = child.getStatus();
      if (status === NodeStatus.PENDING) node.hasPending = true;
      if (status === NodeStatus.IDENTIFIED) node.hasIdentified = true;
      if (status === NodeStatus.IGNORED) node.hasIgnored = true;
      if (status === NodeStatus.NOMATCH) node.hasNoMatch = true;
      if (status === NodeStatus.FILTERED) node.hasFiltered = true;
      if (status === NodeStatus.IDENTIFIED && !child.isDependency())
        node.hasIdentifiedProgress = true;
      if (status === NodeStatus.PENDING && !child.isDependency())
        node.hasPendingProgress = true;
      if (status === NodeStatus.IGNORED && !child.isDependency())
        node.hasIgnoredProgress = true;
      const stat = node.getStatus();
      node.setStatusOnClassnameAs(stat);
    }
  }
}
