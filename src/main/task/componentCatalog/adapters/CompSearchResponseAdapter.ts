import { IComponentResult } from '../iComponentCatalog/IComponentResult';
import * as ComponentMessages from '../../grpc/scanoss/api/components/v2/scanoss-components_pb';
import { ComponentSearchResponse } from '../../../../../../scanoss.js/src';

export class CompSearchResponseAdapter {
  public static convert(response: ComponentSearchResponse): Array<IComponentResult> {
    const output: Array<IComponentResult> = [];
    response.components.forEach((c) => {
      output.push({ component: c.component, purl: c.purl, url: c.url });
    });
    return output;
  }
}
