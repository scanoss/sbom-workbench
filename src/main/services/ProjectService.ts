import { INewProject } from '../../api/types';
import { Project } from '../workspace/Project';
import { workspace } from '../workspace/Workspace';
import { treeService } from './TreeService';

class ProjectService {
  public async scan(project: INewProject, event: Electron.WebContents): Promise<Project> {
    const p = await workspace.createProject(project);
    p.setMailbox(event);
    p.startScanner();
    const tree = treeService.init(event, p.getMyPath(), p.metadata.getScanRoot());
    p.setTree(tree);
    return p;
  }
}

export const projectService = new ProjectService();
