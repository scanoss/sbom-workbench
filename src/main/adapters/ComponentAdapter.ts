import { IComponentLicense } from "../model/interfaces/component/IComponentLicense";

export class ComponentAdapter {
  public componentLicenses(data:any): Array<IComponentLicense>{
    const response = data.reduce((acc,curr)=>{
      if(!acc[curr.id]){
        const aux = { id:curr.id,license:[] }
        aux.license.push(curr.spdxid);
        acc[curr.id] = aux;
      }else
        acc[curr.id].license.push(curr.spdxid);
      return acc;
    },{});

    return Object.values(response);
  }

}
