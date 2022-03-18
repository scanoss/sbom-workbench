import { Project } from '../../workspace/Project';

export abstract class ProjectScanHandler {
  protected project: Project;

  protected msgToUI: Electron.WebContents;

  public abstract init(): Promise<void>;
}
