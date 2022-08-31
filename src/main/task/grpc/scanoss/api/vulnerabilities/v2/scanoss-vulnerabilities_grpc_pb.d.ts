// GENERATED CODE -- DO NOT EDIT!

// package: scanoss.api.vulnerabilities.v2
// file: scanoss/api/vulnerabilities/v2/scanoss-vulnerabilities.proto

import * as scanoss_api_vulnerabilities_v2_scanoss_vulnerabilities_pb from "../../../../scanoss/api/vulnerabilities/v2/scanoss-vulnerabilities_pb";
import * as scanoss_api_common_v2_scanoss_common_pb from "../../../../scanoss/api/common/v2/scanoss-common_pb";
import * as grpc from "@grpc/grpc-js";

interface IVulnerabilitiesService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  echo: grpc.MethodDefinition<scanoss_api_common_v2_scanoss_common_pb.EchoRequest, scanoss_api_common_v2_scanoss_common_pb.EchoResponse>;
  getCpes: grpc.MethodDefinition<scanoss_api_vulnerabilities_v2_scanoss_vulnerabilities_pb.VulnerabilityRequest, scanoss_api_vulnerabilities_v2_scanoss_vulnerabilities_pb.CpeResponse>;
  getVulnerabilities: grpc.MethodDefinition<scanoss_api_vulnerabilities_v2_scanoss_vulnerabilities_pb.VulnerabilityRequest, scanoss_api_vulnerabilities_v2_scanoss_vulnerabilities_pb.VulnerabilityResponse>;
}

export const VulnerabilitiesService: IVulnerabilitiesService;

export interface IVulnerabilitiesServer extends grpc.UntypedServiceImplementation {
  echo: grpc.handleUnaryCall<scanoss_api_common_v2_scanoss_common_pb.EchoRequest, scanoss_api_common_v2_scanoss_common_pb.EchoResponse>;
  getCpes: grpc.handleUnaryCall<scanoss_api_vulnerabilities_v2_scanoss_vulnerabilities_pb.VulnerabilityRequest, scanoss_api_vulnerabilities_v2_scanoss_vulnerabilities_pb.CpeResponse>;
  getVulnerabilities: grpc.handleUnaryCall<scanoss_api_vulnerabilities_v2_scanoss_vulnerabilities_pb.VulnerabilityRequest, scanoss_api_vulnerabilities_v2_scanoss_vulnerabilities_pb.VulnerabilityResponse>;
}

export class VulnerabilitiesClient extends grpc.Client {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  echo(argument: scanoss_api_common_v2_scanoss_common_pb.EchoRequest, callback: grpc.requestCallback<scanoss_api_common_v2_scanoss_common_pb.EchoResponse>): grpc.ClientUnaryCall;
  echo(argument: scanoss_api_common_v2_scanoss_common_pb.EchoRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_common_v2_scanoss_common_pb.EchoResponse>): grpc.ClientUnaryCall;
  echo(argument: scanoss_api_common_v2_scanoss_common_pb.EchoRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_common_v2_scanoss_common_pb.EchoResponse>): grpc.ClientUnaryCall;
  getCpes(argument: scanoss_api_vulnerabilities_v2_scanoss_vulnerabilities_pb.VulnerabilityRequest, callback: grpc.requestCallback<scanoss_api_vulnerabilities_v2_scanoss_vulnerabilities_pb.CpeResponse>): grpc.ClientUnaryCall;
  getCpes(argument: scanoss_api_vulnerabilities_v2_scanoss_vulnerabilities_pb.VulnerabilityRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_vulnerabilities_v2_scanoss_vulnerabilities_pb.CpeResponse>): grpc.ClientUnaryCall;
  getCpes(argument: scanoss_api_vulnerabilities_v2_scanoss_vulnerabilities_pb.VulnerabilityRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_vulnerabilities_v2_scanoss_vulnerabilities_pb.CpeResponse>): grpc.ClientUnaryCall;
  getVulnerabilities(argument: scanoss_api_vulnerabilities_v2_scanoss_vulnerabilities_pb.VulnerabilityRequest, callback: grpc.requestCallback<scanoss_api_vulnerabilities_v2_scanoss_vulnerabilities_pb.VulnerabilityResponse>): grpc.ClientUnaryCall;
  getVulnerabilities(argument: scanoss_api_vulnerabilities_v2_scanoss_vulnerabilities_pb.VulnerabilityRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_vulnerabilities_v2_scanoss_vulnerabilities_pb.VulnerabilityResponse>): grpc.ClientUnaryCall;
  getVulnerabilities(argument: scanoss_api_vulnerabilities_v2_scanoss_vulnerabilities_pb.VulnerabilityRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_vulnerabilities_v2_scanoss_vulnerabilities_pb.VulnerabilityResponse>): grpc.ClientUnaryCall;
}
