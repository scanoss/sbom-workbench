// eslint-disable-next-line import/extensions
import { ISearchComponentVersion } from '../iComponentCatalog/ISearchComponentVersion';
import * as ComponentMessages from '../../grpc/scanoss/api/components/v2/scanoss-components_pb';

export class CompVerSearchRequestBuilder {
  public static build(raw: ISearchComponentVersion) {
    const req = new ComponentMessages.CompVersionRequest();
    if (raw.purl) req.setPurl(raw.purl);
    else throw new Error('Purl is required');
    if (raw.limit) req.setLimit(raw.limit);
    return req;
  }
}
