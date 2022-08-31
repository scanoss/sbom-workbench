// GENERATED CODE -- DO NOT EDIT!

// package: scanoss.api.scanning.v2
// file: scanoss/api/scanning/v2/scanoss-scanning.proto

import * as scanoss_api_scanning_v2_scanoss_scanning_pb from "../../../../scanoss/api/scanning/v2/scanoss-scanning_pb";
import * as scanoss_api_common_v2_scanoss_common_pb from "../../../../scanoss/api/common/v2/scanoss-common_pb";
import * as grpc from "@grpc/grpc-js";

interface IScanningService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  echo: grpc.MethodDefinition<scanoss_api_common_v2_scanoss_common_pb.EchoRequest, scanoss_api_common_v2_scanoss_common_pb.EchoResponse>;
}

export const ScanningService: IScanningService;

export interface IScanningServer extends grpc.UntypedServiceImplementation {
  echo: grpc.handleUnaryCall<scanoss_api_common_v2_scanoss_common_pb.EchoRequest, scanoss_api_common_v2_scanoss_common_pb.EchoResponse>;
}

export class ScanningClient extends grpc.Client {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  echo(argument: scanoss_api_common_v2_scanoss_common_pb.EchoRequest, callback: grpc.requestCallback<scanoss_api_common_v2_scanoss_common_pb.EchoResponse>): grpc.ClientUnaryCall;
  echo(argument: scanoss_api_common_v2_scanoss_common_pb.EchoRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_common_v2_scanoss_common_pb.EchoResponse>): grpc.ClientUnaryCall;
  echo(argument: scanoss_api_common_v2_scanoss_common_pb.EchoRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_common_v2_scanoss_common_pb.EchoResponse>): grpc.ClientUnaryCall;
}
