import { ITask } from '../Task';
import { ISearchComponent } from './iComponentCatalog/ISearchComponent';
import { IComponentResult } from './iComponentCatalog/IComponentResult';
import { gRPCConnectionService } from './gRPCConnection/GRPCConnection';
import * as ComponentMessages from './grpc/scanoss/api/components/v2/scanoss-components_pb';
import { CompSearchRequestBuilder } from './builders/CompSearchRequestBuilder';
import { CompSearchResponseAdapter } from './adapters/CompSearchResponseAdapter';

export class SearchComponentTask implements ITask<ISearchComponent, Array<IComponentResult>> {
  public async run(params: ISearchComponent): Promise<Array<IComponentResult>> {
    const client = gRPCConnectionService.get();
    const req = CompSearchRequestBuilder.build(params);

    const pSearchComponents = new Promise((resolve, reject) => {
      client.searchComponents(req, (err, resp) => {
        if (err) reject(err);
        else resolve(resp);
      });
    });

    const resp = (await pSearchComponents) as ComponentMessages.CompSearchResponse;
    const results = CompSearchResponseAdapter.convert(resp);
    return results;
  }
}
