import log from 'electron-log';
import os from 'os';
import path from 'path';
import { ProjectAccessMode } from '../types';
import { modelProvider } from '../../main/services/ModelProvider';
import { userSettingService } from '../../main/services/UserSettingService';
import { workspace } from '../../main/workspace/Workspace';
import { hasSqliteLockFiles } from '../../main/workspace/sqliteLockHelper';

export async function lockMiddleware(payload: any) {
  try {
    await modelProvider.workspace.openDb();
    const MAX_LOCKING_MINUTES = userSettingService.get().MULTIUSER_LOCK_TIMEOUT;

    const pName = path.basename(payload.path).trim();

    if (payload.mode === ProjectAccessMode.READ_ONLY) return;

    const { username } = os.userInfo();
    const hostname = os.hostname();

    const projectLock = await modelProvider.workspace.lock.getByProjectPath(pName);

    if (!projectLock) {
      log.info('Project locked');
      await modelProvider.workspace.lock.releaseProjects();
      await modelProvider.workspace.lock.create({ username, hostname, projectPath: pName });
    } else {
      const start = new Date(projectLock.updatedAt);
      const end = new Date();

      // Calculate the time difference in milliseconds
      const timeDifference = Math.abs(end.getTime() - start.getTime());

      // Convert the time difference to minutes
      const timeLocking = Math.floor(timeDifference / (1000 * 60));

      // New user trying to access a project blocked by another user
      if ((projectLock.username !== username || projectLock.hostname !== hostname) && timeLocking < MAX_LOCKING_MINUTES) {
        payload.mode = ProjectAccessMode.READ_ONLY;
        payload.lockedBy = `${projectLock.username}@${projectLock.hostname}`;
        return;
      }

      await modelProvider.workspace.lock.delete(projectLock.project, projectLock.username, projectLock.hostname);
      await modelProvider.workspace.lock.create({ projectPath: pName, hostname, username });
    }

    // Check for stale SQLite file-level locks on the project database
    const projectPath = path.join(workspace.getMyPath(), pName);
    if (hasSqliteLockFiles(projectPath)) {
      log.warn(`[ LOCK MIDDLEWARE ]: SQLite lock files detected for project ${pName}`);
      payload.sqliteLocked = true;
    }
  } catch (e: any) {
    console.error(e);
    throw e;
  } finally {
    await modelProvider.workspace.destroy();
  }
}
