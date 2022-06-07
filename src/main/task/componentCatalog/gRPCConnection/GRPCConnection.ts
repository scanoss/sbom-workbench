import * as grpc from '@grpc/grpc-js';
import { AppConfigDefault } from '../../../../config/AppConfigDefault'
import { ComponentsClient } from '../grpc/scanoss/api/components/v2/scanoss-components_grpc_pb';

class GRPCConnection {
  private client: ComponentsClient;

  constructor() {
    this.client = null;
  }

  public get(): ComponentsClient {
    if (!this.client) this.client = new ComponentsClient(`${AppConfigDefault.DEFAULT_IP_gRPC}:${AppConfigDefault.DEFAULT_PORT_gRPC}`, grpc.credentials.createSsl());
    return this.client;
  }
}

export const gRPCConnectionService = new GRPCConnection();
