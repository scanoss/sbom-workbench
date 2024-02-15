import fs from 'fs';
import os from 'os';
import { workspace } from '../../main/workspace/Workspace';

export async function projectPermissionsMiddleware(outOn: number) {
  const p = workspace.getOpenedProjects()[0];
  const { username } = os.userInfo();
  try {
    await fs.promises.access(p.getMyPath(), outOn);
  } catch (e) {
    throw new Error(`User '${username}' does not have permissions on ${p.getMyPath()}`);
  }
}
