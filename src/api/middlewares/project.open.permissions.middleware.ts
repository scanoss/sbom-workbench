/* eslint-disable no-bitwise */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { workspace } from '../../main/workspace/Workspace';
import { ProjectAccessMode } from '../types';

export async function projectOpenPermissionsMiddleware(payload: any) {
  const pName = path.basename(payload.path).trim();
  const pPath = path.join(workspace.getMyPath(), pName);
  const { username } = os.userInfo();
  // be sure the user has read access to pPath
  try {
    await fs.promises.access(pPath, fs.constants.R_OK);
  } catch (e) {
    throw new Error(`User '${username}' has not read permissions on ${pPath}`);
  }

  try {
    await fs.promises.access(pPath, fs.constants.W_OK | fs.constants.X_OK); // Project folder does have write permissions
  } catch (e) {
    payload.mode = ProjectAccessMode.READ_ONLY;
  }
}
