import * as grpc from '@grpc/grpc-js';
import { AppConfigDefault } from '../../../../config/AppConfigDefault';
import { ComponentsClient } from '../grpc/scanoss/api/components/v2/scanoss-components_grpc_pb';
import { userSettingService } from '../../../services/UserSettingService';
import { workspace } from '../../../workspace/Workspace';

class GRPCConnection {
  private client: ComponentsClient;

  private apiKey: string;

  constructor() {
    this.client = null;
    this.apiKey = null;
  }

  public get(): ComponentsClient {
    const { APIS, DEFAULT_API_INDEX } = userSettingService.get();
    const apiKey = workspace.getOpenProject().getApiKey() || APIS[DEFAULT_API_INDEX]?.API_KEY;

    if (this.client == null || this.apiKey !== apiKey) {
      this.apiKey = apiKey;
      const channelCreds = grpc.credentials.createSsl();
      const metaCallback = (_params, callback) => {
        const meta = new grpc.Metadata();
        meta.add('x-api-key', this.apiKey);
        callback(null, meta);
      };
      const callCreds = grpc.credentials.createFromMetadataGenerator(metaCallback);
      const combCreds = grpc.credentials.combineChannelCredentials(channelCreds, callCreds);

      this.client = new ComponentsClient(
        `${AppConfigDefault.DEFAULT_IP_gRPC}:${AppConfigDefault.DEFAULT_PORT_gRPC}`,
        combCreds
      );
    }

    return this.client;
  }
}

export const gRPCConnectionService = new GRPCConnection();
