import { ITask } from "../Task";
import { ISearchgRPCComponent } from "./IComponent/ISearchgRPCComponent";
import { IComponentResult } from "./IComponent/IComponentResult";


export class ComponentgRPCTask implements  ITask <ISearchgRPCComponent,IComponentResult>{

  public async run(params : ISearchgRPCComponent):Promise<IComponentResult>{


    // Here we should call the gRPC service

    return {} as IComponentResult;
  }
}

