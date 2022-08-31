// GENERATED CODE -- DO NOT EDIT!

// package: scanoss.api.dependencies.v2
// file: scanoss/api/dependencies/v2/scanoss-dependencies.proto

import * as scanoss_api_dependencies_v2_scanoss_dependencies_pb from "../../../../scanoss/api/dependencies/v2/scanoss-dependencies_pb";
import * as scanoss_api_common_v2_scanoss_common_pb from "../../../../scanoss/api/common/v2/scanoss-common_pb";
import * as grpc from "@grpc/grpc-js";

interface IDependenciesService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  echo: grpc.MethodDefinition<scanoss_api_common_v2_scanoss_common_pb.EchoRequest, scanoss_api_common_v2_scanoss_common_pb.EchoResponse>;
  getDependencies: grpc.MethodDefinition<scanoss_api_dependencies_v2_scanoss_dependencies_pb.DependencyRequest, scanoss_api_dependencies_v2_scanoss_dependencies_pb.DependencyResponse>;
}

export const DependenciesService: IDependenciesService;

export interface IDependenciesServer extends grpc.UntypedServiceImplementation {
  echo: grpc.handleUnaryCall<scanoss_api_common_v2_scanoss_common_pb.EchoRequest, scanoss_api_common_v2_scanoss_common_pb.EchoResponse>;
  getDependencies: grpc.handleUnaryCall<scanoss_api_dependencies_v2_scanoss_dependencies_pb.DependencyRequest, scanoss_api_dependencies_v2_scanoss_dependencies_pb.DependencyResponse>;
}

export class DependenciesClient extends grpc.Client {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  echo(argument: scanoss_api_common_v2_scanoss_common_pb.EchoRequest, callback: grpc.requestCallback<scanoss_api_common_v2_scanoss_common_pb.EchoResponse>): grpc.ClientUnaryCall;
  echo(argument: scanoss_api_common_v2_scanoss_common_pb.EchoRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_common_v2_scanoss_common_pb.EchoResponse>): grpc.ClientUnaryCall;
  echo(argument: scanoss_api_common_v2_scanoss_common_pb.EchoRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_common_v2_scanoss_common_pb.EchoResponse>): grpc.ClientUnaryCall;
  getDependencies(argument: scanoss_api_dependencies_v2_scanoss_dependencies_pb.DependencyRequest, callback: grpc.requestCallback<scanoss_api_dependencies_v2_scanoss_dependencies_pb.DependencyResponse>): grpc.ClientUnaryCall;
  getDependencies(argument: scanoss_api_dependencies_v2_scanoss_dependencies_pb.DependencyRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_dependencies_v2_scanoss_dependencies_pb.DependencyResponse>): grpc.ClientUnaryCall;
  getDependencies(argument: scanoss_api_dependencies_v2_scanoss_dependencies_pb.DependencyRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_dependencies_v2_scanoss_dependencies_pb.DependencyResponse>): grpc.ClientUnaryCall;
}
