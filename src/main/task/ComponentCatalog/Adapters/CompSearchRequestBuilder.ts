import { ISearchgRPCComponent } from '../IComponent/ISearchgRPCComponent';
import * as ComponentMessages from '../grpc/scanoss/api/components/v2/scanoss-components_pb';

export class CompSearchRequestBuilder {
  public static build(raw: ISearchgRPCComponent): ComponentMessages.CompSearchRequest {
    const req = new ComponentMessages.CompSearchRequest();
    if(raw.component) req.setComponent(raw.component);
    if(raw.package) req.setPackage(raw.package)
    if(raw.limit) req.setComponent(raw.component);
    return req;
  }
}

