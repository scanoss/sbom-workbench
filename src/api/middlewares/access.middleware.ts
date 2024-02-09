import { workspace } from '../../main/workspace/Workspace';
import { modelProvider } from '../../main/services/ModelProvider';
import os from 'os';

export async function accessMiddleware() {
  const p = workspace.getOpenedProjects()[0];
  if (!p) throw new Error('No opened project');

  const { username } = os.userInfo();
  const hostname = os.hostname();

  const lock = await modelProvider.workspace.lock.get(p.metadata.getName(), username, hostname);

  if (!lock) throw new Error(`Project is locked by ${username}@${hostname}`);
}
