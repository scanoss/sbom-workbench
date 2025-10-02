import { IComponentVersionResult, ILicense, IVersion } from '../iComponentCatalog/IComponentVersionResult';
import { ComponentVersionResponse } from 'scanoss';

export class CompoVerSearchResponseAdapter {
  public static convert(response: ComponentVersionResponse): IComponentVersionResult {
    const output: IComponentVersionResult = {
      component: response.component.component,
      url: response.component.url,
      purl: response.component.purl,
      versions: [],
    };
    response.component.versions.forEach((v) => {
      const aux: IVersion = { version: v.version, licenses: [] };
      v.licenses.forEach((l) => {
        const auxLicense: ILicense = {
          name: l.name,
          spdxId: l.spdxId,
          isSpdxApproved: l.isSpdxApproved,
          url: l.url,
        };
        aux.licenses.push(auxLicense);
      });
      output.versions.push(aux);
    });
    return output;
  }
}
