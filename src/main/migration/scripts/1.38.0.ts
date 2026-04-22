import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { ProjectSource } from '../../../api/types';
import { Project } from '../../workspace/Project';
import { IndexTreeTask } from '../../task/IndexTreeTask/IndexTreeTask';
import { CodeIndexTreeTask } from '../../task/IndexTreeTask/CodeIndexTreeTask';
import { WFPIndexTreeTask } from '../../task/IndexTreeTask/WFPIndexTreeTask';
import { RawResultFileTreeTask } from '../../task/rawImportResult/RawResultFileTreeTask';
import { CollectFilesVisitor } from '../../workspace/tree/visitor/CollectFilesVisitor';
import File from '../../workspace/tree/File';
export async function projectMigration1380(projectPath: string): Promise<void> {
  try {
    log.info('%cProject Migration 1.38.0 in progress...', 'color:green');
    await fixWfpSource(projectPath);
    await backfillFileMd5(projectPath);
    log.info('%cProject Migration 1.38.0 finished', 'color:green');
  } catch (e: any) {
    log.error('[ Project Migration 1.38.0 ] failed', e);
  }
}

/**
 * Retags legacy SCAN projects whose scan_root points at a `.wfp` file as
 * ProjectSource.WFP. Rewrites metadata.json in-place (only the `source`
 * field). When Project.readFromPath runs later in the migration, it picks up
 * the persisted value, and Project.upgrade() re-reads it after all scripts
 * finish so the upgraded project opens correctly tagged.
 */
async function fixWfpSource(projectPath: string): Promise<void> {
  const metadataPath = path.join(projectPath, 'metadata.json');
  const raw = JSON.parse(await fs.promises.readFile(metadataPath, 'utf8'));
  if (
    raw.source !== ProjectSource.SCAN
    || typeof raw.scan_root !== 'string'
    || !raw.scan_root.toLowerCase().endsWith('.wfp')
  ) return;
  raw.source = ProjectSource.WFP;
  await fs.promises.writeFile(metadataPath, JSON.stringify(raw, null, 2));
}

function openDb(projectPath: string): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(
      `${projectPath}/scan_db`,
      sqlite3.OPEN_READWRITE,
      (err) => (err ? reject(err) : resolve(db)),
    );
  });
}

function closeDb(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.close((err) => (err ? reject(err) : resolve()));
  });
}

function run(db: sqlite3.Database, sql: string, params: any[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => (err ? reject(err) : resolve()));
  });
}

/*
┌───────────────────────┬───────────────────────┬───────────────────────────┬─────────────────┬───────────────┬─────────┐
│        Source         │    metadata.source    │        Source code        │   result.json   │ winnowing.wfp │ scan_db │
├───────────────────────┼───────────────────────┼───────────────────────────┼─────────────────┼───────────────┼─────────┤
│ 1. Normal scan        │ SCAN                  │ ✅                         │ ✅               │ ✅             │ ✅       │
├───────────────────────┼───────────────────────┼───────────────────────────┼─────────────────┼───────────────┼─────────┤
│ 2. Import result.json │ IMPORT_SCAN_RESULTS   │ optional                  │ ✅               │ ❌             │ ✅       │
├───────────────────────┼───────────────────────┼───────────────────────────┼─────────────────┼───────────────┼─────────┤
│ 3. Import winnowing   │ SCAN (no distinction) │ may be missing            │ yes after merge │ ✅             │ ✅       │
├───────────────────────┼───────────────────────┼───────────────────────────┼─────────────────┼───────────────┼─────────┤
│ 4. Import .zip        │ IMPORTED              │ optional (sourceCodePath) │ ✅               │ ✅             │ ✅       │
└───────────────────────┴───────────────────────┴───────────────────────────┴─────────────────┴───────────────┴─────────┘
*/
/**
 * Picks the IndexTreeTask used to rebuild the project's file tree so the
 * migration can extract a md5 for every file.
 */
function createIndexTask(project: Project, projectPath: string): IndexTreeTask {
  switch (project.metadata.getSource()) {
    case ProjectSource.IMPORTED:
      // ProjectZipper nulls scan_root on export; point at workspace WFP.
      project.metadata.setScanRoot(path.join(projectPath, 'winnowing.wfp'));
      return new WFPIndexTreeTask(project);
    case ProjectSource.WFP:
      return new WFPIndexTreeTask(project);
    case ProjectSource.IMPORT_SCAN_RESULTS:
      return new RawResultFileTreeTask(project);
    default:
      return new CodeIndexTreeTask(project);
  }
}

async function backfillFileMd5(projectPath: string): Promise<void> {
  const db = await openDb(projectPath);
  try {
    await ensureMd5FileColumn(db);

    const project = await Project.readFromPath(projectPath);
    const task = createIndexTask(project, projectPath);
    log.info(
      `[ Project Migration 1.38.0 ] projectSource=${project.metadata.getSource()} ` +
      `scanRoot=${project.getScanRoot()} indexTask=${task.constructor.name}`,
    );
    const tree = await task.buildTree();

    const collector = new CollectFilesVisitor();
    tree.getRootFolder().accept<void>(collector);

    await applyMd5Updates(db, collector.files);
    log.info(`[ Project Migration 1.38.0 ] backfilled md5_file for ${collector.files.length} tree files`);
  } finally {
    await closeDb(db).catch(() => { /* noop */ });
  }
}

function ensureMd5FileColumn(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.all('PRAGMA table_info(files);', async (err, cols: any[]) => {
      if (err) return reject(err);
      if (cols.some((c) => c.name === 'md5_file')) return resolve();
      try {
        await run(db, 'ALTER TABLE files ADD COLUMN md5_file TEXT;');
        log.info('[ Project Migration 1.38.0 ] added md5_file column to files table');
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  });
}

async function applyMd5Updates(db: sqlite3.Database, files: File[]): Promise<void> {
  if (files.length === 0) return;

  await run(db, 'BEGIN TRANSACTION');
  try {
    for (const file of files) {
      const md5 = file.getMD5();
      if (!md5) continue;
      await run(
        db,
        "UPDATE files SET md5_file = ? WHERE path = ? AND (md5_file IS NULL OR md5_file = '')",
        [md5, file.getPath()],
      );
    }
    await run(db, 'COMMIT');
  } catch (e) {
    await run(db, 'ROLLBACK').catch(() => { /* noop */ });
    throw e;
  }
}
