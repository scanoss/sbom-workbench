import * as grpc from "@grpc/grpc-js";
import { ComponentsClient } from "./grpc/scanoss/api/components/v2/scanoss-components_grpc_pb";
import * as ComponentMessages from "./grpc/scanoss/api/components/v2/scanoss-components_pb"
import * as CommonMessages from './grpc/scanoss/api/common/v2/scanoss-common_pb'


class GRPCConnection {
  private client: ComponentsClient;

  constructor() {
    this.client = null;
  }

  public get(): ComponentsClient {
    if (!this.client) return new ComponentsClient("localhost:50053",grpc.credentials.createInsecure());
    return this.client
  }
}

export const gRPCConnectionService = new GRPCConnection();
