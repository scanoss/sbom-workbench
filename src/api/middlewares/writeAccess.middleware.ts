import os from 'os';
import path from 'path';
import { workspace } from '../../main/workspace/Workspace';
import { modelProvider } from '../../main/services/ModelProvider';

/**
 * Middleware for checking write access to a specified project or the first opened project.
 *
 * @param {string} [projectPath] - Optional. The path of the project to check for write access.
 *                                  If not provided, the first opened project is used.
 *
 */

export async function writeAccessMiddleware(projectPath?: string) {
  try {
    await modelProvider.workspace.openDb();

    let pName = '';
    if (!projectPath) {
      const p = workspace.getOpenedProjects()[0];
      if (!p) throw new Error('No opened project');
      pName = p.metadata.getName();
    } else {
      pName = path.basename(projectPath).trim();
    }

    const { username } = os.userInfo();
    const hostname = os.hostname();

    const lock = await modelProvider.workspace.lock.getByProjectPath(pName);
    if (lock && (lock.username !== username || lock.hostname !== hostname)) {
      throw new Error(`Project is locked by ${lock.username}@${lock.hostname}`);
    }
  } finally {
    await modelProvider.workspace.destroy();
  }
}
