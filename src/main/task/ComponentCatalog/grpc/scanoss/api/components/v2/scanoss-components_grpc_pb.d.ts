// GENERATED CODE -- DO NOT EDIT!

// package: scanoss.api.components.v2
// file: scanoss/api/components/v2/scanoss-components.proto

import * as scanoss_api_components_v2_scanoss_components_pb from "./scanoss-components_pb";
import * as scanoss_api_common_v2_scanoss_common_pb from "../../common/v2/scanoss-common_pb";
import * as grpc from "@grpc/grpc-js";

interface IComponentsService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  echo: grpc.MethodDefinition<scanoss_api_common_v2_scanoss_common_pb.EchoRequest, scanoss_api_common_v2_scanoss_common_pb.EchoResponse>;
  searchComponents: grpc.MethodDefinition<scanoss_api_components_v2_scanoss_components_pb.CompSearchRequest, scanoss_api_components_v2_scanoss_components_pb.CompSearchResponse>;
  getComponentVersions: grpc.MethodDefinition<scanoss_api_components_v2_scanoss_components_pb.CompVersionRequest, scanoss_api_components_v2_scanoss_components_pb.CompVersionResponse>;
}

export const ComponentsService: IComponentsService;

export interface IComponentsServer extends grpc.UntypedServiceImplementation {
  echo: grpc.handleUnaryCall<scanoss_api_common_v2_scanoss_common_pb.EchoRequest, scanoss_api_common_v2_scanoss_common_pb.EchoResponse>;
  searchComponents: grpc.handleUnaryCall<scanoss_api_components_v2_scanoss_components_pb.CompSearchRequest, scanoss_api_components_v2_scanoss_components_pb.CompSearchResponse>;
  getComponentVersions: grpc.handleUnaryCall<scanoss_api_components_v2_scanoss_components_pb.CompVersionRequest, scanoss_api_components_v2_scanoss_components_pb.CompVersionResponse>;
}

export class ComponentsClient extends grpc.Client {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  echo(argument: scanoss_api_common_v2_scanoss_common_pb.EchoRequest, callback: grpc.requestCallback<scanoss_api_common_v2_scanoss_common_pb.EchoResponse>): grpc.ClientUnaryCall;
  echo(argument: scanoss_api_common_v2_scanoss_common_pb.EchoRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_common_v2_scanoss_common_pb.EchoResponse>): grpc.ClientUnaryCall;
  echo(argument: scanoss_api_common_v2_scanoss_common_pb.EchoRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_common_v2_scanoss_common_pb.EchoResponse>): grpc.ClientUnaryCall;
  searchComponents(argument: scanoss_api_components_v2_scanoss_components_pb.CompSearchRequest, callback: grpc.requestCallback<scanoss_api_components_v2_scanoss_components_pb.CompSearchResponse>): grpc.ClientUnaryCall;
  searchComponents(argument: scanoss_api_components_v2_scanoss_components_pb.CompSearchRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_components_v2_scanoss_components_pb.CompSearchResponse>): grpc.ClientUnaryCall;
  searchComponents(argument: scanoss_api_components_v2_scanoss_components_pb.CompSearchRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_components_v2_scanoss_components_pb.CompSearchResponse>): grpc.ClientUnaryCall;
  getComponentVersions(argument: scanoss_api_components_v2_scanoss_components_pb.CompVersionRequest, callback: grpc.requestCallback<scanoss_api_components_v2_scanoss_components_pb.CompVersionResponse>): grpc.ClientUnaryCall;
  getComponentVersions(argument: scanoss_api_components_v2_scanoss_components_pb.CompVersionRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_components_v2_scanoss_components_pb.CompVersionResponse>): grpc.ClientUnaryCall;
  getComponentVersions(argument: scanoss_api_components_v2_scanoss_components_pb.CompVersionRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_components_v2_scanoss_components_pb.CompVersionResponse>): grpc.ClientUnaryCall;
}
