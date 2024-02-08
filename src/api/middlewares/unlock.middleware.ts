import { modelProvider } from '../../main/services/ModelProvider';
import os from 'os';
import { workspace } from '../../main/workspace/Workspace';

export async function unlockMiddleware() {

  console.log("Unlock Middleware");

  const p =  workspace.getOpenedProjects()[0];

  const username = os.userInfo().username;
  const hostname = os.hostname();

  const projectLock = await modelProvider.workspace.lock.get(p.getProjectName(), username, hostname);

  // Unlock project only if user has assigned the project
  if (projectLock) {
    await modelProvider.workspace.lock.delete(p.getProjectName(), username, hostname);
  }
}
