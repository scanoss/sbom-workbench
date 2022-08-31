import * as grpc from '@grpc/grpc-js';
import { AppConfigDefault } from '../../../../config/AppConfigDefault';
import { ComponentsClient } from "../scanoss/api/components/v2/scanoss-components_grpc_pb";
import { userSettingService } from '../../../services/UserSettingService';
import { workspace } from '../../../workspace/Workspace';
import { VulnerabilitiesClient } from "../scanoss/api/vulnerabilities/v2/scanoss-vulnerabilities_grpc_pb";

class GRPCConnection {

  private vulnerabilityClient: VulnerabilitiesClient;

  private componentCatalogClient: grpc.Client;

  constructor() {
    this.componentCatalogClient = null;
    this.vulnerabilityClient = null;
  }

  private getApiKey(): string {
    const { APIS, DEFAULT_API_INDEX } = userSettingService.get();
    return workspace.getOpenProject().getApiKey() || APIS[DEFAULT_API_INDEX]?.API_KEY;
  }

  private getEndpoint(): string {
    return `${AppConfigDefault.DEFAULT_IP_gRPC}:${AppConfigDefault.DEFAULT_PORT_gRPC}`
  }

  private getCredentials(): grpc.ChannelCredentials {
    const channelCreds = grpc.credentials.createSsl();
    const metaCallback = (_params, callback) => {
      const meta = new grpc.Metadata();
      meta.add('x-api-key', this.getApiKey());
      callback(null, meta);
    };
    const callCreds = grpc.credentials.createFromMetadataGenerator(metaCallback);
    return grpc.credentials.combineChannelCredentials(channelCreds, callCreds);
  }

  private getInsecureCredentials(): grpc.ChannelCredentials {
    return grpc.credentials.createInsecure();
  }

  public getComponentCatalogStub(): grpc.Client {
    if (!this.componentCatalogClient)
      this.componentCatalogClient = new ComponentsClient(this.getEndpoint(),this.getCredentials());
    return this.componentCatalogClient;
  }

  public getVulnerabilityStub(): grpc.Client {
    if (!this.vulnerabilityClient)
      this.vulnerabilityClient = new VulnerabilitiesClient("ns3029088.ip-51-255-68.eu:50051",this.getInsecureCredentials());
    return this.vulnerabilityClient;
  }

}


export const gRPCConnections = new GRPCConnection();


