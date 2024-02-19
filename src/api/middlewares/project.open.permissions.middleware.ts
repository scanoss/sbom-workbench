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
  const wPath = workspace.getMyPath();

  try {
    await fs.promises.access(wPath, fs.constants.R_OK | fs.constants.W_OK | fs.constants.X_OK);
  } catch (e) {
    throw new Error(`User '${username}' has not R/W permissions on ${wPath}`);
  }

  try {
    await fs.promises.access(pPath, fs.constants.R_OK);
  } catch (e) {
    throw new Error(`User '${username}' has not R permissions on ${pPath}`);
  }

  try {
    await fs.promises.access(pPath, fs.constants.W_OK | fs.constants.X_OK); // Project folder does have write permissions
  } catch (e) {
    payload.mode = ProjectAccessMode.READ_ONLY;
  }
}
