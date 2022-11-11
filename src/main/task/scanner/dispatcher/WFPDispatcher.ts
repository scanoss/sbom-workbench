import { IDispatch } from "./IDispatch";
import { Project } from "../../../workspace/Project";

export class WFPDispatcher implements IDispatch {
  dispatch(project: Project, file: string): void {
    delete project.filesToScan[file];
  }

}
