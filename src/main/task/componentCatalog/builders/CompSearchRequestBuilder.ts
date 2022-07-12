import { ISearchComponent } from '../iComponentCatalog/ISearchComponent';
import * as ComponentMessages from '../grpc/scanoss/api/components/v2/scanoss-components_pb.js';

export class CompSearchRequestBuilder {
  public static build(raw: ISearchComponent): ComponentMessages.CompSearchRequest {
    const req = new ComponentMessages.CompSearchRequest();
    if (raw.search) req.setSearch(raw.search);
    if (raw.vendor) req.setVendor(raw.vendor);
    if (raw.component) req.setComponent(raw.component);
    if (raw.package) req.setPackage(raw.package);
    if (raw.limit) req.setLimit(raw.limit);
    return req;
  }
}
