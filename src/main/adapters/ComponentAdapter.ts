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

  public componentFileAdapter(data:any){
    const response = data.reduce((acc, curr) => {
      if (!acc[curr.id]) {
        const aux = {
          id: curr.id,
          type: curr.type,
          path: curr.path,
          lines: curr.lines,
          oss_lines: curr.oss_lines,
          matched: curr.matched,
          inventoryid: curr.inventoryid,
          file: curr.file,
          file_url:curr.file_url,
          url:curr.url,
          componentName:curr.componentName,
          md5_file: curr.md5_file,
          url_hash: curr.url_hash,
          purl: curr.purl,
          version: curr.version,
          latest: curr.latest,
          identified: curr.identified,
          ignored: curr.ignored,
          license: [],
        };
        aux.license.push(curr.spdxid);
        acc[curr.id] = aux;
      } else {
        acc[curr.id].license.push(curr.spdxid);
      }return acc;
    }, {});

    return Object.values(response);
  }

}
