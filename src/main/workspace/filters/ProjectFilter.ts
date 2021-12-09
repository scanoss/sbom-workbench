import { Project } from '../Project';

export abstract class ProjectFilter {
  public abstract isValid(project: Project): boolean;

  public abstract getParam():any;
}
