import log from 'electron-log';
import sqlite3 from 'sqlite3';
import { IDependencyResponse } from 'scanoss';
import fs from 'fs';
import { Querys } from '../../model/querys_db';
import { dependencyService } from '../../services/DependencyService';
import { fileHelper } from '../../helpers/FileHelper';
import { modelProvider } from '../../services/ModelProvider';

export async function dependenciesMigration0220(projectPath): Promise<void> {
  log.info('%c[ MIGRATION ] IN PROGRESS...', 'color: green');
  try {
    await dbMigration0200(projectPath);
    await modelProvider.init(projectPath);
    await depMigration(projectPath);
    log.info('%c[ MIGRATION ] FINISHED', 'color: green');
  } catch (e) {
    log.error(e);
    throw e;
  }
}

function dbMigration0200(projectPath): Promise<void> {
  const query = new Querys();
  return new Promise((resolve, reject) => {
    try {
      const db: any = new sqlite3.Database(`${projectPath}/scan_db`, sqlite3.OPEN_READWRITE, (err: any) => {
        if (err) log.error(err);
        db.run("ALTER TABLE inventories ADD COLUMN source TEXT DEFAULT 'detected';");
        db.run(query.DEPENDENCY_TABLE);
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function depMigration(projectPath) {
  const depPath = `${projectPath}/dependencies.json`;
  const exist = await fileHelper.fileExist(depPath);
  if (exist) {
    const oldDep = JSON.parse(await fs.promises.readFile(depPath, 'utf-8'));
    const newDep = parseOldDependency(oldDep);
    fs.promises.unlink(depPath);
    fs.promises.writeFile(depPath, JSON.stringify(newDep, null, 2));
    await insertDependenciesDb(newDep);
  }
}

function parseOldDependency(oldDep: any): IDependencyResponse {
  const newDep = <IDependencyResponse>{ filesList: [] };
  for (const file of oldDep.files) {
    const dependenciesList = [];
    for (const dep of file.dependencies) {
      dependenciesList.push({
        component: null,
        purl: dep.purl,
        version: null,
        licensesList: [
          {
            name: null,
            spdxId: null,
            isSpdxApproved: false,
          },
        ],
      });
    }
    newDep.filesList.push({
      file: file.file,
      id: file.id,
      status: file.status,
      dependenciesList,
    });
  }
  return newDep;
}

async function insertDependenciesDb(dependencies: IDependencyResponse): Promise<void> {
  await dependencyService.insert(dependencies);
}
