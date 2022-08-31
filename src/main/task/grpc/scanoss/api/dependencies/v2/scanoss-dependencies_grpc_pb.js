// GENERATED CODE -- DO NOT EDIT!

// Original file comments:
//
// SPDX-License-Identifier: MIT
//
// Copyright (c) 2022, SCANOSS
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
// **
// Dependency definition details
// *
'use strict';
var grpc = require('@grpc/grpc-js');
var scanoss_api_dependencies_v2_scanoss$dependencies_pb = require('../../../../scanoss/api/dependencies/v2/scanoss-dependencies_pb.js');
var scanoss_api_common_v2_scanoss$common_pb = require('../../../../scanoss/api/common/v2/scanoss-common_pb.js');

function serialize_scanoss_api_common_v2_EchoRequest(arg) {
  if (!(arg instanceof scanoss_api_common_v2_scanoss$common_pb.EchoRequest)) {
    throw new Error('Expected argument of type scanoss.api.common.v2.EchoRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_scanoss_api_common_v2_EchoRequest(buffer_arg) {
  return scanoss_api_common_v2_scanoss$common_pb.EchoRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_scanoss_api_common_v2_EchoResponse(arg) {
  if (!(arg instanceof scanoss_api_common_v2_scanoss$common_pb.EchoResponse)) {
    throw new Error('Expected argument of type scanoss.api.common.v2.EchoResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_scanoss_api_common_v2_EchoResponse(buffer_arg) {
  return scanoss_api_common_v2_scanoss$common_pb.EchoResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_scanoss_api_dependencies_v2_DependencyRequest(arg) {
  if (!(arg instanceof scanoss_api_dependencies_v2_scanoss$dependencies_pb.DependencyRequest)) {
    throw new Error('Expected argument of type scanoss.api.dependencies.v2.DependencyRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_scanoss_api_dependencies_v2_DependencyRequest(buffer_arg) {
  return scanoss_api_dependencies_v2_scanoss$dependencies_pb.DependencyRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_scanoss_api_dependencies_v2_DependencyResponse(arg) {
  if (!(arg instanceof scanoss_api_dependencies_v2_scanoss$dependencies_pb.DependencyResponse)) {
    throw new Error('Expected argument of type scanoss.api.dependencies.v2.DependencyResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_scanoss_api_dependencies_v2_DependencyResponse(buffer_arg) {
  return scanoss_api_dependencies_v2_scanoss$dependencies_pb.DependencyResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


//
// Expose all of the SCANOSS Dependency RPCs here
var DependenciesService = exports.DependenciesService = {
  // Standard echo
echo: {
    path: '/scanoss.api.dependencies.v2.Dependencies/Echo',
    requestStream: false,
    responseStream: false,
    requestType: scanoss_api_common_v2_scanoss$common_pb.EchoRequest,
    responseType: scanoss_api_common_v2_scanoss$common_pb.EchoResponse,
    requestSerialize: serialize_scanoss_api_common_v2_EchoRequest,
    requestDeserialize: deserialize_scanoss_api_common_v2_EchoRequest,
    responseSerialize: serialize_scanoss_api_common_v2_EchoResponse,
    responseDeserialize: deserialize_scanoss_api_common_v2_EchoResponse,
  },
  // Get dependency details
getDependencies: {
    path: '/scanoss.api.dependencies.v2.Dependencies/GetDependencies',
    requestStream: false,
    responseStream: false,
    requestType: scanoss_api_dependencies_v2_scanoss$dependencies_pb.DependencyRequest,
    responseType: scanoss_api_dependencies_v2_scanoss$dependencies_pb.DependencyResponse,
    requestSerialize: serialize_scanoss_api_dependencies_v2_DependencyRequest,
    requestDeserialize: deserialize_scanoss_api_dependencies_v2_DependencyRequest,
    responseSerialize: serialize_scanoss_api_dependencies_v2_DependencyResponse,
    responseDeserialize: deserialize_scanoss_api_dependencies_v2_DependencyResponse,
  },
};

exports.DependenciesClient = grpc.makeGenericClientConstructor(DependenciesService);
