import { modelProvider } from '../../main/services/ModelProvider';
import { workspace } from '../../main/workspace/Workspace';

/**
 * Middleware for refreshing the lock timer on the currently opened project.
 *
 * It ensures that the lock on the project remains active, preventing other
 * or users from accessing it concurrently.
 */
export async function refreshMiddleware() {
  try {
    await modelProvider.workspace.openDb();

    const p = workspace.getOpenedProjects()[0];
    const lock = await modelProvider.workspace.lock.updateTimer({ projectPath: p.metadata.getName() });
  } finally {
    await modelProvider.workspace.destroy();
  }
}
