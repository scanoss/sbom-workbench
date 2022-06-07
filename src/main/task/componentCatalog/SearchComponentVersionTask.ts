import util from 'util';
import { ITask } from '../Task';
import { ISearchComponentVersion } from './iComponentCatalog/ISearchComponentVersion';
import { gRPCConnectionService } from './gRPCConnection/GRPCConnection';
import * as ComponentMessages from './grpc/scanoss/api/components/v2/scanoss-components_pb';
import { IComponentVersionResult } from './iComponentCatalog/IComponentVersionResult';
import { CompVerSearchRequestBuilder } from './builders/CompVerSearchRequestBuilder';
import { CompoVerSearchResponseAdapter } from './adapters/CompoVerSearchResponseAdapter';

export class SearchComponentVersionTask implements ITask<ISearchComponentVersion, IComponentVersionResult> {
  public async run(params: ISearchComponentVersion): Promise<IComponentVersionResult> {
    const client = gRPCConnectionService.get();
    const req = CompVerSearchRequestBuilder.build(params);

    const pSearchComponentsVersions = new Promise((resolve, reject) => {
      client.getComponentVersions(req, (err, resp) => {
        if (err) reject(err)
        else resolve(resp)
      })});

    const resp = (await pSearchComponentsVersions) as ComponentMessages.CompVersionResponse;
    const results = CompoVerSearchResponseAdapter.convert(resp);
    return results;
  }
}

