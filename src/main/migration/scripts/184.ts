import { userSettingService } from '../../services/UserSettingService';
import { workspace } from '../../workspace/Workspace';

const fs = require('fs').promises;
const path = require('path');

export async function wsMigration184(wsPath: string): Promise<void> {
  updateProjectPathsOnWorkspace();
  userSettingService.setSetting('VERSION', '1.8.4');
  await userSettingService.save();

}

async function getDirs(wsPath: string): Promise<Array<string>> {
  const files = await fs.readdir(wsPath, { withFileTypes: true });
  const folders: Array<string> = [];
  files.forEach((f) => {
    if (f.isDirectory()) folders.push(f.name);
  });
  return folders;
}

 function updateProjectPathsOnWorkspace() {
  const projects = workspace.getProjects();
  projects.forEach((p) => {
    p.setMyPath(p.getProjectName());
  });
  workspace.setProjectList(projects);
}
