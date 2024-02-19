import { modelProvider } from '../../main/services/ModelProvider';
import { workspace } from '../../main/workspace/Workspace';

export async function refreshMiddleware() {
  try {
    await modelProvider.workspace.openDb();

    const p = workspace.getOpenedProjects()[0];
    const lock = await modelProvider.workspace.lock.updateTimer({ projectPath: p.metadata.getName() });
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    await modelProvider.workspace.destroy();
  }
}
