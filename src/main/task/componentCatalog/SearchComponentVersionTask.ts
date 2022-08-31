import { ITask } from '../Task';
import { ISearchComponentVersion } from './iComponentCatalog/ISearchComponentVersion';
import { gRPCConnections } from '../grpc/gRPCConnection/gRPCConnection'
import * as ComponentMessages from '../grpc/scanoss/api/components/v2/scanoss-components_pb';
import { IComponentVersionResult } from './iComponentCatalog/IComponentVersionResult';
import { CompVerSearchRequestBuilder } from './builders/CompVerSearchRequestBuilder';
import { CompoVerSearchResponseAdapter } from './adapters/CompoVerSearchResponseAdapter';
import { StatusCode } from "../grpc/scanoss/api/common/v2/scanoss-common_pb";
import { ComponentsClient } from "../grpc/scanoss/api/components/v2/scanoss-components_grpc_pb";

export class SearchComponentVersionTask implements ITask<ISearchComponentVersion, IComponentVersionResult> {
  public async run(params: ISearchComponentVersion): Promise<IComponentVersionResult> {
    const client = gRPCConnections.getComponentCatalogStub() as ComponentsClient;
    const req = CompVerSearchRequestBuilder.build(params);
    const pSearchComponentsVersions = new Promise((resolve, reject) => {
      client.getComponentVersions(req, (err, resp) => {
        if (err) reject(err);
        else resolve(resp);
      });
    });
    const resp = (await pSearchComponentsVersions) as ComponentMessages.CompVersionResponse;
    if (resp.getStatus().getStatus() !== StatusCode.SUCCESS) throw new Error(resp.getStatus().getMessage());
    const results = CompoVerSearchResponseAdapter.convert(resp);
    return results;
  }
}
