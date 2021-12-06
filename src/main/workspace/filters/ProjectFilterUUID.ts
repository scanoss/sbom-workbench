import { Project } from '../Project';
import { ProjectFilter } from './ProjectFilter';

export class ProjectFilterUUID extends ProjectFilter {
  private uuid: string;

  constructor(uuid: string) {
    super();
    this.uuid = uuid;
  }

  public getParam(): any{
    return this.uuid;
  }

  public isValid(project: Project): boolean {
    return project.getUUID() === this.uuid;
  }
}
