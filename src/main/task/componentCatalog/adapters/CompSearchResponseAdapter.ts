import { IComponentResult } from '../iComponentCatalog/IComponentResult';
import { ComponentSearchResponse } from 'scanoss';

export class CompSearchResponseAdapter {
  public static convert(response: ComponentSearchResponse): Array<IComponentResult> {
    const output: Array<IComponentResult> = [];
    response.components.forEach((c) => {
      output.push({ component: c.component, purl: c.purl, url: c.url });
    });
    return output;
  }
}
