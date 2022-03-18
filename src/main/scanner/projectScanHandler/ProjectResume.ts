import { ProjectFilterPath } from '../../workspace/filters/ProjectFilterPath';
import { Project } from '../../workspace/Project';
import { workspace } from '../../workspace/Workspace';
import { ResumeScan } from '../ResumeScan';
import { ProjectScanHandler } from './ProjectScanHandler';

export class ProjectResume extends ProjectScanHandler {
  public async set(projectPath: string, event: Electron.WebContents): Promise<void> {
    const p: Project = workspace.getProject(new ProjectFilterPath(projectPath));
    await p.open();
    this.project = p;
    this.msgToUI = event;
  }

  public async init(): Promise<void> {
    const resume = new ResumeScan(this.project, this.msgToUI);
    await resume.scanStateValidation();
    resume.init();
    resume.scan();
  }
}
