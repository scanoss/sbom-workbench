import * as grpc from '@grpc/grpc-js';
import { AppConfigDefault } from '../../../../config/AppConfigDefault';
import { ComponentsClient } from '../scanoss/api/components/v2/scanoss-components_grpc_pb';
import { workspace } from '../../../workspace/Workspace';
import { VulnerabilitiesClient } from '../scanoss/api/vulnerabilities/v2/scanoss-vulnerabilities_grpc_pb';
import fs from 'fs';
import { userSettingService } from '../../../services/UserSettingService';

class GRPCConnection {
  private vulnerabilityClient: VulnerabilitiesClient;

  private componentCatalogClient: grpc.Client;

  constructor() {
    this.componentCatalogClient = null;
    this.vulnerabilityClient = null;
  }

  private getApiKey(): string {
    return workspace.getOpenProject().getApiKey();
  }

  /**
   * Gets the SCANOSS gRPC host URL for API connections
   * @returns The formatted host URL as host:port. api.scanoss.com:443
   */private getScanossHost(): string {
    return `${AppConfigDefault.DEFAULT_IP_gRPC}:${AppConfigDefault.DEFAULT_PORT_gRPC}`;
  }

  /**
   * Gets the OSSKB (Open Source Knowledge Base) gRPC host URL for API connections
   * @returns The formatted host URL as host:port. api.osskb.org:443
   */
  private getOsskbHost(): string {
    return `${AppConfigDefault.OSSKB_HOST}:${AppConfigDefault.DEFAULT_PORT_gRPC}`
  }

  private async getCredentials(): Promise<grpc.ChannelCredentials> {

    const { GRPC_PROXY, CA_CERT } = userSettingService.get();
    process.env.grpc_proxy = GRPC_PROXY ? GRPC_PROXY : '';

    let cc = grpc.credentials.createSsl();

    if (CA_CERT && GRPC_PROXY) {
      const caCert = await fs.promises.readFile(CA_CERT);
      cc = grpc.credentials.createSsl(caCert);
    }

    const metaCallback = (_params, callback) => {
      const meta = new grpc.Metadata();
      meta.add('x-api-key', this.getApiKey());
      callback(null, meta);
    };
    const callCreds = grpc.credentials.createFromMetadataGenerator(metaCallback);
    return grpc.credentials.combineChannelCredentials(cc, callCreds);
  }

  private getInsecureCredentials(): grpc.ChannelCredentials {
    return grpc.credentials.createInsecure();
  }

  public async getComponentCatalogStub(): Promise<grpc.Client> {
    this.componentCatalogClient = null;
    this.componentCatalogClient = new ComponentsClient(this.getScanossHost(), await this.getCredentials());
    return this.componentCatalogClient;
  }

  public async getVulnerabilityStub(): Promise<grpc.Client> {
    const hasApiKey = !!this.getApiKey();

    const endpoint = !hasApiKey
      ? this.getOsskbHost()
      : this.getScanossHost();

    const credentials = !hasApiKey
      ? grpc.credentials.createSsl()
      : await this.getCredentials();

    this.vulnerabilityClient = new VulnerabilitiesClient(endpoint, credentials);
    return this.vulnerabilityClient;
  }
}

export const gRPCConnections = new GRPCConnection();
