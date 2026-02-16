import fs from 'fs';
import log from 'electron-log';
import path from 'path';

const SQLITE_LOCK_EXTENSIONS = ['-journal', '-wal', '-shm'];
const PROJECT_DB_NAME = 'scan_db';

/**
 * Returns a list of SQLite lock/journal file paths that exist for a given project.
 */
export function getSqliteLockFiles(projectPath: string): string[] {
  const dbPath = path.join(projectPath, PROJECT_DB_NAME);
  const lockFiles: string[] = [];
  for (const ext of SQLITE_LOCK_EXTENSIONS) {
    const lockFile = dbPath + ext;
    if (fs.existsSync(lockFile)) {
      lockFiles.push(lockFile);
    }
  }
  return lockFiles;
}

/**
 * Checks whether the project SQLite database has stale lock files
 * (journal, WAL, or SHM files).
 */
export function hasSqliteLockFiles(projectPath: string): boolean {
  return getSqliteLockFiles(projectPath).length > 0;
}

/**
 * Removes SQLite lock/journal files for a project database.
 * This should only be called when the database connection is fully closed.
 */
export function removeSqliteLockFiles(projectPath: string): void {
  const lockFiles = getSqliteLockFiles(projectPath);
  for (const lockFile of lockFiles) {
    try {
      fs.unlinkSync(lockFile);
      log.info(`[ SQLITE LOCK ]: Removed lock file ${lockFile}`);
    } catch (err: any) {
      log.warn(`[ SQLITE LOCK ]: Failed to remove lock file ${lockFile}: ${err.message}`);
    }
  }
}
