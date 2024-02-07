import { modelProvider } from '../../main/services/ModelProvider';
import util from 'util';
import os from 'os';

export async function unlockMiddleware(projectPath: string) {

  const username = os.userInfo().username;
  const hostname = os.hostname();

  const projectLock = await modelProvider.workspace.lock.get(projectPath, username, hostname);

  // Unlock project only if user has assigned the project
  if (projectLock) {
    await modelProvider.workspace.lock.delete(projectPath, username, hostname);
  }
}
