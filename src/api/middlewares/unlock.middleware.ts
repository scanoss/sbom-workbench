import os from 'os';
import { modelProvider } from '../../main/services/ModelProvider';
import { workspace } from '../../main/workspace/Workspace';

export async function unlockMiddleware() {
  const p = workspace.getOpenedProjects()[0];
  if (!p) return;

  const { username } = os.userInfo();
  const hostname = os.hostname();

  const projectLock = await modelProvider.workspace.lock.get(p.getProjectName(), username, hostname);

  // Unlock project only if user has assigned the project
  if (projectLock) {
    await modelProvider.workspace.lock.delete(p.getProjectName(), username, hostname);
  }
}
