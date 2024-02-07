import { modelProvider } from '../../main/services/ModelProvider';
import { ProjectAccessMode } from '../types';
import log from 'electron-log';
import os from 'os';

const MAX_LOCKING_MINUTES = 1;

export async function lockMiddleware(projectPath: string, mode: ProjectAccessMode) {
  console.log("Lock middleware");

  if (mode === ProjectAccessMode.READ_ONLY) return;

  const username = os.userInfo().username;
  const hostname = os.hostname();

  const projectLock = await modelProvider.workspace.lock.getByProjectPath(projectPath);

  if (!projectLock) {
    log.info('Project locked');
    await modelProvider.workspace.lock.create({username, hostname, projectPath: projectPath})
  } else {
    const start = new Date(projectLock.updatedAt);
    const end = new Date();

    // Calculate the time difference in milliseconds
    const timeDifference = Math.abs(end.getTime() - start.getTime());

    // Convert the time difference to minutes
    const timeLocking = Math.floor(timeDifference / (1000 * 60));

    //New user trying to access a project blocked by another user
    if ((projectLock.username !== username || projectLock.hostname !== hostname) && timeLocking <= MAX_LOCKING_MINUTES) {
      mode = ProjectAccessMode.READ_ONLY;
      return;
    }

    await modelProvider.workspace.lock.delete(projectLock.project, projectLock.username, projectLock.hostname);
    await modelProvider.workspace.lock.create( { projectPath,  hostname, username }  )
  }



}
