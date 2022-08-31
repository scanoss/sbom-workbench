import * as ComponentMessages from '../../grpc/scanoss/api/components/v2/scanoss-components_pb';
import { IComponentVersionResult, ILicense, IVersion } from '../iComponentCatalog/IComponentVersionResult';

export class CompoVerSearchResponseAdapter {
  public static convert(response: ComponentMessages.CompVersionResponse): IComponentVersionResult {
    const comp = response.getComponent();
    const output: IComponentVersionResult = {
      component: comp.getComponent(),
      url: comp.getUrl(),
      purl: comp.getPurl(),
      versions: [],
    };
    comp.getVersionsList().forEach((v) => {
      const aux: IVersion = { version: v.getVersion(), licenses: [] };
      v.getLicensesList().forEach((l) => {
        const auxLicense: ILicense = {
          name: l.getName(),
          spdxId: l.getSpdxId(),
          isSpdxApproved: l.getIsSpdxApproved(),
          url: l.getUrl(),
        };
        aux.licenses.push(auxLicense);
      });
      output.versions.push(aux);
    });
    return output;
  }
}
