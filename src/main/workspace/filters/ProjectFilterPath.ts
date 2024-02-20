import { Project } from '../Project';
import { ProjectFilter } from './ProjectFilter';

export class ProjectFilterPath extends ProjectFilter {
  private path: string;

  constructor(path: string) {
    super();
    this.path = path;
  }

  public getParam(): any {
    return this.path;
  }

  public isValid(project: Project): boolean {
    return project.getWorkRoot() === this.path;
  }
}
