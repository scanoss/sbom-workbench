import { IComponentResult } from '../iComponentCatalog/IComponentResult';
import * as ComponentMessages from '../../grpc/scanoss/api/components/v2/scanoss-components_pb';

export class CompSearchResponseAdapter {
  public static convert(response: ComponentMessages.CompSearchResponse): Array<IComponentResult> {
    const output: Array<IComponentResult> = [];
    response.getComponentsList().forEach((comp) => {
      output.push({ component: comp.getComponent(), purl: comp.getPurl(), url: comp.getUrl() });
    });
    return output;
  }
}
