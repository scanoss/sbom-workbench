import { IDispatch } from "./IDispatch";
import { Project } from "../../../workspace/Project";

export class CodeDispatcher implements IDispatch {
  dispatch(project:Project,file: string): void {
    delete project.filesToScan[`${project.getScanRoot()}${file}`];
  }

}
