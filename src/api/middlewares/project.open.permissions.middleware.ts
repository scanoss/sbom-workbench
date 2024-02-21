/* eslint-disable no-bitwise */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { workspace } from '../../main/workspace/Workspace';
import { ProjectAccessMode } from '../types';

/**
 * Middleware for verifying access permissions to a project in the workspace.
 * This function checks if the user has R/W  permissions on the workspace folder
 * and R/W permissions on the specific project folder.
 * If the user lacks write and execute permissions on the project folder,
 * the project is opened in read-only mode.
 *
 * @param {string} payload.path - The path of the project to be verified.
 * @throws {Error} Throws an error if the user does not have the necessary permissions
 *                 on either the workspace or the project folder.
 */
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
