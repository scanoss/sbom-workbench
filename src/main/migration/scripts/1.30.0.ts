import log from 'electron-log';
import sqlite3 from 'sqlite3';
import { PackageURL } from 'packageurl-js';
import { FileModel } from '../../model/project/models/FileModel';
import fs from 'fs';
import { Metadata } from '../../workspace/Metadata';
import path from 'path';

export async function projectMigration1300(projectPath: string): Promise<void> {
  try {
    log.info('%cApp Migration 1.30.0 in progress...', 'color:green');
    await addUrlColumnToDependencyTable(projectPath);
    await updateFileSummary(projectPath);
    log.info('%cApp Migration 1.30.0 finished', 'color:green');
  } catch (e: any) {
    log.error(e);
  }
}

function getProjectUrl(purlName: string, purlType: string): string {
  if (!purlName || !purlType) {
    return '';
  }

  switch (purlType) {
    case 'github':
      return `https://github.com/${purlName}`;
    case 'npm':
      return `https://www.npmjs.com/package/${purlName}`;
    case 'maven':
      return `https://mvnrepository.com/artifact/${purlName}`;
    case 'gem':
      return `https://rubygems.org/gems/${purlName}`;
    case 'pypi':
      return `https://pypi.org/project/${purlName}`;
    case 'golang':
      return `https://pkg.go.dev/${purlName}`;
    case 'nuget':
      return `https://www.nuget.org/packages/${purlName}`;
    default:
      return '';
  }
}

function getPurlName(purl: string): { type: string; name: string } | null {
  try {
    const parsed = PackageURL.fromString(purl);
    const name = parsed.namespace ? `${parsed.namespace}/${parsed.name}` : parsed.name;
    return { type: parsed.type, name };
  } catch (e) {
    return null;
  }
}

async function addUrlColumnToDependencyTable(projectPath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const db = new sqlite3.Database(
      `${projectPath}/scan_db`,
      sqlite3.OPEN_READWRITE,
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        db.run('ALTER TABLE dependencies ADD COLUMN url TEXT DEFAULT "";', (alterErr) => {
          if (alterErr) {
            db.close();
            reject(alterErr);
            return;
          }
          log.info('Added url column to dependencies table');
          updateExistingDependenciesUrl(db, resolve, reject);
        });
      }
    );
  });
}

async function updateExistingDependenciesUrl(
  db: sqlite3.Database,
  resolve: () => void,
  reject: (err: Error) => void
): Promise<void> {
  db.all(
    "SELECT dependencyId, purl FROM dependencies WHERE url IS NULL OR url = '';",
    async (selectErr, rows: any[]) => {
      if (selectErr) {
        db.close();
        reject(selectErr);
        return;
      }

      if (!rows || rows.length === 0) {
        log.info('No dependencies to update');
        db.close((closeErr) => {
          if (closeErr) reject(closeErr);
          else resolve();
        });
        return;
      }

      log.info(`Updating URL for ${rows.length} dependencies`);

      try {
        for (const row of rows) {
          const parsed = getPurlName(row.purl);
          if (!parsed) continue;

          const url = getProjectUrl(parsed.name, parsed.type);
          if (!url) continue;

          await runQuery(db, 'UPDATE dependencies SET url = ? WHERE dependencyId = ?;', [url, row.dependencyId]);
        }

        db.close((closeErr) => {
          if (closeErr) reject(closeErr);
          else resolve();
        });
      } catch (e) {
        db.close();
        reject(e as Error);
      }
    }
  );
}

function runQuery(db: sqlite3.Database, query: string, params: any[]): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(query, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function updateFileSummary(projectPath: string){
  let db: sqlite3.Database | null = null;

  try {
    db = new sqlite3.Database(`${projectPath}/scan_db`, sqlite3.OPEN_READWRITE);
    const fileModel = new FileModel(db);
    const summary = await fileModel.getSummary();

    const metadataPath = path.join(projectPath, 'metadata.json');
    const treePath = path.join(projectPath, 'tree.json');

    // Backup original files for rollback
    const originalMetadata = await fs.promises.readFile(metadataPath, 'utf8');
    const originalTree = await fs.promises.readFile(treePath, 'utf8');

    try {
      log.info('Updating file summary in metadata.json');
      const mt: Metadata = await Metadata.readFromPath(projectPath);
      mt.setFileCounter(summary.totalFiles);
      mt.save();

      log.info('Updating file summary in tree.json');
      const tree = JSON.parse(originalTree);
      const scannedFiles = summary.matchFiles + summary.noMatchFiles;
      const filteredFiles = summary.totalFiles - (scannedFiles);
      tree.filesSummary = {
        total: summary.totalFiles,
        include: scannedFiles,
        filter: filteredFiles,
        files: {}
      }
      tree.processedFiles = scannedFiles;
      await fs.promises.writeFile(treePath, JSON.stringify(tree), 'utf-8');
      log.info('File summary updated');
    } catch (e) {
      log.error('Error updating file summary, rolling back changes...', e);
      await fs.promises.writeFile(metadataPath, originalMetadata, 'utf-8');
      await fs.promises.writeFile(treePath, originalTree, 'utf-8');
      log.info('Rollback completed');
      throw e;
    }
  } finally {
    db?.close();
  }
}
