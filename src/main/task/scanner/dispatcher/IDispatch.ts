import { Project } from "../../../workspace/Project";

export interface IDispatch {
  dispatch(project:Project,file :string):void;
}
