import os from 'os';
import { workspace } from '../../main/workspace/Workspace';
import { modelProvider } from '../../main/services/ModelProvider';

export async function accessMiddleware() {
  try {
    await modelProvider.workspace.openDb();

    const p = workspace.getOpenedProjects()[0];
    if (!p) throw new Error('No opened project');

    const { username } = os.userInfo();
    const hostname = os.hostname();

    const lock = await modelProvider.workspace.lock.getByProjectPath(p.metadata.getName());
    if (lock.username !== username && lock.hostname !== hostname) throw new Error(`Project is locked by ${lock.username}@${lock.username}`);
  } finally {
    await modelProvider.workspace.destroy();
  }
}
