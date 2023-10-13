import { userSettingService } from '../../services/UserSettingService';
import { workspace } from '../../workspace/Workspace';

export async function wsMigration184(): Promise<void> {
  updateProjectPathsOnWorkspace();
  userSettingService.setSetting('VERSION', '1.8.4');
  await userSettingService.save();

}
function updateProjectPathsOnWorkspace() {
  const projects = workspace.getProjects();
  projects.forEach((p) => {
    p.setMyPath(p.getProjectName());
  });
  workspace.setProjectList(projects);
}
