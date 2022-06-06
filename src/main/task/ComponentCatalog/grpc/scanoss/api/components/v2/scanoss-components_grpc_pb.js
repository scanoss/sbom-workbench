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
// ComponentCatalog definition details
// *
'use strict';
var grpc = require('@grpc/grpc-js');
var scanoss_api_components_v2_scanoss$components_pb = require('./scanoss-components_pb.d.ts');
var scanoss_api_common_v2_scanoss$common_pb = require('../../common/v2/scanoss-common_pb.d.ts');

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

function serialize_scanoss_api_components_v2_CompSearchRequest(arg) {
  if (!(arg instanceof scanoss_api_components_v2_scanoss$components_pb.CompSearchRequest)) {
    throw new Error('Expected argument of type scanoss.api.components.v2.CompSearchRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_scanoss_api_components_v2_CompSearchRequest(buffer_arg) {
  return scanoss_api_components_v2_scanoss$components_pb.CompSearchRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_scanoss_api_components_v2_CompSearchResponse(arg) {
  if (!(arg instanceof scanoss_api_components_v2_scanoss$components_pb.CompSearchResponse)) {
    throw new Error('Expected argument of type scanoss.api.components.v2.CompSearchResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_scanoss_api_components_v2_CompSearchResponse(buffer_arg) {
  return scanoss_api_components_v2_scanoss$components_pb.CompSearchResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_scanoss_api_components_v2_CompVersionRequest(arg) {
  if (!(arg instanceof scanoss_api_components_v2_scanoss$components_pb.CompVersionRequest)) {
    throw new Error('Expected argument of type scanoss.api.components.v2.CompVersionRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_scanoss_api_components_v2_CompVersionRequest(buffer_arg) {
  return scanoss_api_components_v2_scanoss$components_pb.CompVersionRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_scanoss_api_components_v2_CompVersionResponse(arg) {
  if (!(arg instanceof scanoss_api_components_v2_scanoss$components_pb.CompVersionResponse)) {
    throw new Error('Expected argument of type scanoss.api.components.v2.CompVersionResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_scanoss_api_components_v2_CompVersionResponse(buffer_arg) {
  return scanoss_api_components_v2_scanoss$components_pb.CompVersionResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


//
// Expose all of the SCANOSS ComponentCatalog RPCs here
var ComponentsService = exports.ComponentsService = {
  // Standard echo
echo: {
    path: '/scanoss.api.components.v2.Components/Echo',
    requestStream: false,
    responseStream: false,
    requestType: scanoss_api_common_v2_scanoss$common_pb.EchoRequest,
    responseType: scanoss_api_common_v2_scanoss$common_pb.EchoResponse,
    requestSerialize: serialize_scanoss_api_common_v2_EchoRequest,
    requestDeserialize: deserialize_scanoss_api_common_v2_EchoRequest,
    responseSerialize: serialize_scanoss_api_common_v2_EchoResponse,
    responseDeserialize: deserialize_scanoss_api_common_v2_EchoResponse,
  },
  // Search for components
searchComponents: {
    path: '/scanoss.api.components.v2.Components/SearchComponents',
    requestStream: false,
    responseStream: false,
    requestType: scanoss_api_components_v2_scanoss$components_pb.CompSearchRequest,
    responseType: scanoss_api_components_v2_scanoss$components_pb.CompSearchResponse,
    requestSerialize: serialize_scanoss_api_components_v2_CompSearchRequest,
    requestDeserialize: deserialize_scanoss_api_components_v2_CompSearchRequest,
    responseSerialize: serialize_scanoss_api_components_v2_CompSearchResponse,
    responseDeserialize: deserialize_scanoss_api_components_v2_CompSearchResponse,
  },
  // Get all version information for a specific component
getComponentVersions: {
    path: '/scanoss.api.components.v2.Components/GetComponentVersions',
    requestStream: false,
    responseStream: false,
    requestType: scanoss_api_components_v2_scanoss$components_pb.CompVersionRequest,
    responseType: scanoss_api_components_v2_scanoss$components_pb.CompVersionResponse,
    requestSerialize: serialize_scanoss_api_components_v2_CompVersionRequest,
    requestDeserialize: deserialize_scanoss_api_components_v2_CompVersionRequest,
    responseSerialize: serialize_scanoss_api_components_v2_CompVersionResponse,
    responseDeserialize: deserialize_scanoss_api_components_v2_CompVersionResponse,
  },
};

exports.ComponentsClient = grpc.makeGenericClientConstructor(ComponentsService);
