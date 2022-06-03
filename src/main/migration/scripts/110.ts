import sqlite3 from 'sqlite3';
import log from 'electron-log';
import fs from 'fs';
import { modelProvider } from '../../services/ModelProvider';
import { Querys } from '../../model/querys_db';
import { utilModel } from '../../model/UtilModel';
import { broadcastManager } from '../../broadcastManager/BroadcastManager';
import { IpcEvents } from '../../../api/ipc-events';
import { Indexer } from '../../modules/searchEngine/indexer/Indexer';
import { IIndexer } from '../../modules/searchEngine/indexer/IIndexer';

export async function migration110(projectPath: string): Promise<void> {
  log.info('Migration 1.1.0 In progress...');
  broadcastManager.get().send(IpcEvents.MIGRATION_INIT, { data: 'Updating project to v1.1.0' });
  await modelProvider.init(projectPath);
  await updateTables(projectPath);
  await removeLicenseColumOnResult(projectPath);
  const filesResult = await getFilesResults(projectPath);
  const result: Record<any, any> = await utilModel.readFile(`${projectPath}/result.json`);
  await insertResultLicense(projectPath, filesResult, result);
  const componentReliableLicense = await modelProvider.model.component.getMostReliableLicensePerComponent();
  await modelProvider.model.component.updateMostReliableLicense(componentReliableLicense);
  await indexMigration(projectPath);
  log.info('Migration 1.1.0 finished');
  broadcastManager.get().send(IpcEvents.MIGRATION_FINISH);
}

async function updateTables(projectPath: string) {
  const query = new Querys();
  return new Promise<void>((resolve, reject) => {
    try {
      const db: any = new sqlite3.Database(`${projectPath}/scan_db`, sqlite3.OPEN_READWRITE, (err: any) => {
        if (err) log.error(err);
        db.run('DROP VIEW IF EXISTS components;');
        db.run(query.RESULT_LICENSE);
        db.run('ALTER TABLE component_versions ADD COLUMN reliableLicense varchar(100) DEFAULT NULL;');
        db.run(
          'CREATE VIEW IF NOT EXISTS components (id,name,version,purl,url,source,reliableLicense) AS SELECT DISTINCT comp.id AS compid ,comp.name,comp.version,comp.purl,comp.url,comp.source,comp.reliableLicense FROM component_versions AS comp LEFT JOIN license_component_version lcv ON comp.id=lcv.cvid;'
        );
        db.close();
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function getFilesResults(projectPath: string) {
  return new Promise<Array<any>>((resolve, reject) => {
    try {
      const db: any = new sqlite3.Database(`${projectPath}/scan_db`, sqlite3.OPEN_READWRITE, (err: any) => {
        if (err) log.error(err);
        db.all(
          'SELECT f.path, r.id AS resultId FROM files f INNER JOIN results r ON f.fileId=r.fileId;',
          (error: any, data: any) => {
            db.close();
            resolve(data);
          }
        );
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function insertResultLicense(projectPath: string, filesResult: Array<any>, results: Record<any, any>) {
  return new Promise<void>((resolve, reject) => {
    try {
      const db: any = new sqlite3.Database(`${projectPath}/scan_db`, sqlite3.OPEN_READWRITE, (err: any) => {
        if (err) log.error(err);
        db.serialize(async () => {
          db.run('begin transaction');
          filesResult.forEach((fr) => {
            results[fr.path].forEach((r) => {
              r.licenses.forEach((l) => {
                db.run(
                  'INSERT OR IGNORE INTO result_license (spdxid,source,resultId,patent_hints,copyLeft,osadl_updated,incompatible_with,checklist_url) VALUES (?,?,?,?,?,?,?,?);',
                  l.name,
                  l.source,
                  fr.resultId,
                  l.patent_hints ? l.patent_hints : null,
                  l.copyleft ? l.copyleft : null,
                  l.osadl_updated ? l.osadl_updated : null,
                  l.incompatible_with ? l.incompatible_with : null,
                  l.checklist_url ? l.checklist_url : null
                );
              });
            });
          });
          db.run('commit', (err: Error) => {
            if (err) throw err;
            db.close();
            resolve();
          });
        });
      });
    } catch (err: any) {
      log.error(err);
      reject();
    }
  });
}

async function removeLicenseColumOnResult(projectPath: string) {
  return new Promise<void>((resolve, reject) => {
    try {
      const db: any = new sqlite3.Database(`${projectPath}/scan_db`, sqlite3.OPEN_READWRITE, (err: any) => {
        if (err) log.error(err);
        db.serialize(async () => {
          db.run('begin transaction');
          db.run(
            'CREATE TABLE IF NOT EXISTS t1_backup (id integer primary key asc,md5_file text,fileId integer, vendor text, component text, version text, latest_version text, cpe text, url text, lines text, oss_lines text, matched text, filename text, size text, idtype text, md5_comp text,compid integer,purl text,file_url text,source text,dirty INTEGER default 0, FOREIGN KEY (fileId) REFERENCES files(fileId));'
          );
          db.run(
            'INSERT INTO t1_backup SELECT id,md5_file,fileId, vendor, component,version,latest_version, cpe , url , lines, oss_lines , matched, filename , size, idtype, md5_comp,compid ,purl,file_url ,source,dirty FROM results;'
          );
          db.run('DROP TABLE results;');
          db.run('DROP VIEW IF EXISTS summary;');
          db.run('ALTER TABLE t1_backup RENAME TO results;');
          db.run(`
          CREATE VIEW IF NOT EXISTS summary AS SELECT cv.id AS compid,cv.purl,cv.version,SUM(f.ignored) AS ignored, SUM(f.identified) AS identified,
          SUM(f.identified=0 AND f.ignored=0) AS pending
          FROM files f INNER JOIN Results r ON r.fileId=f.fileId
          INNER JOIN component_versions cv ON cv.purl=r.purl
          AND cv.version=r.version
          GROUP BY r.purl, r.version
          ORDER BY cv.id ASC;
          `);
          db.run('commit', (err: any) => {
            if (err) throw err;
            db.close();
            resolve();
          });
        });
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function indexMigration(projectPath: string) {
  await modelProvider.init(projectPath);
  const files = await modelProvider.model.file.getAll(null);
  const indexer = new Indexer();
  const data = JSON.parse(await fs.promises.readFile(`${projectPath}/metadata.json`, 'utf-8'));
  const filesToIndex = fileAdapter(files, data.scan_root);
  const index = indexer.index(filesToIndex);
  await indexer.saveIndex(index, `${projectPath}/dictionary/`);
}

function fileAdapter(modelFiles: any, scanRoot: string): Array<IIndexer> {
  const filesToIndex = [];
  modelFiles.forEach((file: any) => {
    if (file.filter !== 'FILTERED') filesToIndex.push({ fileId: file.id, path: `${scanRoot}${file.path}` });
  });
  return filesToIndex;
}
