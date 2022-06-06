import * as util from 'util';
import { ITask } from '../Task';
import { ISearchgRPCComponent } from './IComponent/ISearchgRPCComponent';
import { IComponentResult } from './IComponent/IComponentResult';
import { gRPCConnectionService } from './GRPCConnection';

import * as ComponentMessages from './grpc/scanoss/api/components/v2/scanoss-components_pb';

import { CompSearchRequestBuilder } from './Adapters/CompSearchRequestBuilder';
import { CompSearchResponseAdapter } from './Adapters/CompSearchResponseAdapter';

export class SearchComponentTask implements ITask<ISearchgRPCComponent, Array<IComponentResult>> {
  public async run(params: ISearchgRPCComponent): Promise<Array<IComponentResult>> {
    const client = gRPCConnectionService.get();
    const req = CompSearchRequestBuilder.build(params);
    const pSearchComponents = util.promisify(client.searchComponents);
    const resp = (await pSearchComponents(req)) as ComponentMessages.CompSearchResponse;
    const results = CompSearchResponseAdapter.convert(resp);
    return results;
  }
}
