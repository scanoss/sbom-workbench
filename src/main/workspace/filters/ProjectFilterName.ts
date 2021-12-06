import { Project } from '../Project';
import { ProjectFilter } from './ProjectFilter';

export class ProjectFilterName extends ProjectFilter {
  private name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  public getParam(): any {
    return this.name;
  }

  public isValid(project: Project): boolean {
    return project.getProjectName() === this.name;
  }
}
