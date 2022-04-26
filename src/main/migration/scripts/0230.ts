
import sqlite3 from 'sqlite3';
import {Querys} from "../../model/querys_db";
import log from "electron-log";
import {ScannerTask} from "../../task/scanner/ScannerTask";
import fs from "fs";
import {dependencyService} from "../../services/DependencyService";
import {projectService} from "../../services/ProjectService";
import {workspace} from "../../workspace/Workspace";
import {ProjectFilter} from "../../workspace/filters/ProjectFilter";
import {ProjectFilterPath} from "../../workspace/filters/ProjectFilterPath";
import {dependencyHelper} from "../../helpers/DependencyHelper";
import {fileHelper} from "../../helpers/FileHelper";
import {modelProvider} from "../../services/ModelProvider";
import {Tree} from "../../workspace/Tree/Tree/Tree";

export async function migration0230(projectPath: string): Promise<void> {
  log.info("Migration 0230 In progress...");
    await regenerateDependencyTable(projectPath);
  await importDependencies(projectPath);
}


async function regenerateDependencyTable(projectPath): Promise<void> {
  const query = new Querys();
  return new Promise((resolve, reject) => {
    try {
      const db: any = new sqlite3.Database(`${projectPath}/scan_db`, sqlite3.OPEN_READWRITE, (err: any) => {
        if (err) log.error(err);
        db.run("DROP TABLE IF EXISTS dependencies;");
        db.run(query.DEPENDENCY_TABLE);
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}


 async function  importDependencies(projectPath: string){
  try {

    const dependencies = JSON.parse(
      await fs.promises.readFile(`${projectPath}/dependencies.json`, 'utf8'));

    //import dependencies on file fileTree
    const project = await fs.promises.readFile(`${projectPath}/tree.json`, 'utf8');
    const a = JSON.parse(project);
    const tree = new Tree(projectPath, null);
    tree.loadTree(a.tree.rootFolder);
    tree.addDependencies(dependencies);
    a.tree  = tree;
    await fs.promises.writeFile(`${projectPath}/tree.json`, JSON.stringify(a));

    // import dependencies on DB
    const filesDependencies = dependencyHelper.dependecyModelAdapter(dependencies);
    const files = await getPathFileId(projectPath);
    const filesIds = [];
    filesDependencies.forEach((fileDependency) => {
      fileDependency.fileId=files[fileDependency.file];
      filesIds.push(files[fileDependency.file]);
    });
    await updateFileType(projectPath,filesIds,"MATCH");
    await insert(projectPath,filesDependencies);

  } catch (e) {
    log.error(e);
  }
}

async function getPathFileId(projectPath:string) {
  const query = new Querys();
  return new Promise((resolve, reject) => {
    try {
      const db: any = new sqlite3.Database(`${projectPath}/scan_db`, sqlite3.OPEN_READWRITE, (err: any) => {
        if (err) log.error(err);
        db.all("SELECT f.fileId AS id,f.type,f.path,f.identified,f.ignored,r.matched,r.idtype AS type,r.lines,r.oss_lines,r.file_url,fi.inventoryid, r.license, r.component AS componentName, r.url,comp.purl,comp.version\n  FROM files f LEFT JOIN results r ON r.fileId=f.fileId LEFT JOIN component_versions comp ON\n  comp.purl = r.purl AND comp.version = r.version\n  LEFT JOIN file_inventories fi ON fi.fileId=f.fileId",(err: any, files: any) => {
          if (err) log.error(err);
          db.close();
          const pathFileId = files.reduce((acc, file) => {
            acc[file.path] = file.id;
            return acc;
          }, {});
          resolve(pathFileId);
        });
      });
    } catch (e) {
      reject(e);
    }
  });
}




async function  updateFileType(projectPath,fileIds: number[], fileType: string) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const db: any = new sqlite3.Database(`${projectPath}/scan_db`, sqlite3.OPEN_READWRITE, (err: any) => {
        const SQLquery = `UPDATE files SET type=? WHERE fileId IN (${fileIds.toString()});`;
        db.run(SQLquery, fileType, (err: any) => {
          if (err) throw err;
          db.close();
          resolve();
        });
      });
    } catch (error) {
      log.error(error);
      reject(error);
    }
  });
}

 async function insert(projectPath,filesDependencies: any) {
  return new Promise(async (resolve, reject) => {
    try {
      const query = new Querys();
      const db: any = new sqlite3.Database(`${projectPath}/scan_db`, sqlite3.OPEN_READWRITE, (err: any) => {
      db.serialize(() => {
        db.run('begin transaction');
        filesDependencies.forEach((file) => {
          file.dependenciesList.forEach((dependency) => {
            db.run(
              query.SQL_DEPENDENCIES_INSERT,
              file.fileId,
              dependency.purl ? decodeURIComponent(dependency.purl) : null,
              dependency.version ? dependency.version : null,
              dependency.scope ? dependency.scope : null,
              dependency.licensesList.length > 0 &&
              dependency.licensesList[0] !== ''
                ? dependency.licensesList.join(',')
                : null,
              dependency.component,
              dependency.version ? dependency.version : null,
              dependency.licensesList.length > 0 &&
              dependency.licensesList[0] !== ''
                ? dependency.licensesList.join(',')
                : null
            );
          });
        });
        db.run('commit', (err: any) => {
          db.close();
          if (err) throw err;
          resolve(true);
        });
      });
    });
    } catch (err) {
      reject(err);
    }
  });
}
