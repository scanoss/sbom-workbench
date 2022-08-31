// package: scanoss.api.vulnerabilities.v2
// file: scanoss/api/vulnerabilities/v2/scanoss-vulnerabilities.proto

import * as jspb from "google-protobuf";
import * as scanoss_api_common_v2_scanoss_common_pb from "../../../../scanoss/api/common/v2/scanoss-common_pb";

export class VulnerabilityRequest extends jspb.Message {
  clearPurlsList(): void;
  getPurlsList(): Array<VulnerabilityRequest.Purls>;
  setPurlsList(value: Array<VulnerabilityRequest.Purls>): void;
  addPurls(value?: VulnerabilityRequest.Purls, index?: number): VulnerabilityRequest.Purls;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VulnerabilityRequest.AsObject;
  static toObject(includeInstance: boolean, msg: VulnerabilityRequest): VulnerabilityRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: VulnerabilityRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VulnerabilityRequest;
  static deserializeBinaryFromReader(message: VulnerabilityRequest, reader: jspb.BinaryReader): VulnerabilityRequest;
}

export namespace VulnerabilityRequest {
  export type AsObject = {
    purlsList: Array<VulnerabilityRequest.Purls.AsObject>,
  }

  export class Purls extends jspb.Message {
    getPurl(): string;
    setPurl(value: string): void;

    getRequirement(): string;
    setRequirement(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Purls.AsObject;
    static toObject(includeInstance: boolean, msg: Purls): Purls.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Purls, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Purls;
    static deserializeBinaryFromReader(message: Purls, reader: jspb.BinaryReader): Purls;
  }

  export namespace Purls {
    export type AsObject = {
      purl: string,
      requirement: string,
    }
  }
}

export class CpeResponse extends jspb.Message {
  clearPurlsList(): void;
  getPurlsList(): Array<CpeResponse.Purls>;
  setPurlsList(value: Array<CpeResponse.Purls>): void;
  addPurls(value?: CpeResponse.Purls, index?: number): CpeResponse.Purls;

  hasStatus(): boolean;
  clearStatus(): void;
  getStatus(): scanoss_api_common_v2_scanoss_common_pb.StatusResponse | undefined;
  setStatus(value?: scanoss_api_common_v2_scanoss_common_pb.StatusResponse): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CpeResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CpeResponse): CpeResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CpeResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CpeResponse;
  static deserializeBinaryFromReader(message: CpeResponse, reader: jspb.BinaryReader): CpeResponse;
}

export namespace CpeResponse {
  export type AsObject = {
    purlsList: Array<CpeResponse.Purls.AsObject>,
    status?: scanoss_api_common_v2_scanoss_common_pb.StatusResponse.AsObject,
  }

  export class Purls extends jspb.Message {
    getPurl(): string;
    setPurl(value: string): void;

    clearCpesList(): void;
    getCpesList(): Array<string>;
    setCpesList(value: Array<string>): void;
    addCpes(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Purls.AsObject;
    static toObject(includeInstance: boolean, msg: Purls): Purls.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Purls, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Purls;
    static deserializeBinaryFromReader(message: Purls, reader: jspb.BinaryReader): Purls;
  }

  export namespace Purls {
    export type AsObject = {
      purl: string,
      cpesList: Array<string>,
    }
  }
}

export class VulnerabilityResponse extends jspb.Message {
  clearPurlsList(): void;
  getPurlsList(): Array<VulnerabilityResponse.Purls>;
  setPurlsList(value: Array<VulnerabilityResponse.Purls>): void;
  addPurls(value?: VulnerabilityResponse.Purls, index?: number): VulnerabilityResponse.Purls;

  hasStatus(): boolean;
  clearStatus(): void;
  getStatus(): scanoss_api_common_v2_scanoss_common_pb.StatusResponse | undefined;
  setStatus(value?: scanoss_api_common_v2_scanoss_common_pb.StatusResponse): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VulnerabilityResponse.AsObject;
  static toObject(includeInstance: boolean, msg: VulnerabilityResponse): VulnerabilityResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: VulnerabilityResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VulnerabilityResponse;
  static deserializeBinaryFromReader(message: VulnerabilityResponse, reader: jspb.BinaryReader): VulnerabilityResponse;
}

export namespace VulnerabilityResponse {
  export type AsObject = {
    purlsList: Array<VulnerabilityResponse.Purls.AsObject>,
    status?: scanoss_api_common_v2_scanoss_common_pb.StatusResponse.AsObject,
  }

  export class Vulnerabilities extends jspb.Message {
    getId(): string;
    setId(value: string): void;

    getCve(): string;
    setCve(value: string): void;

    getUrl(): string;
    setUrl(value: string): void;

    getSummary(): string;
    setSummary(value: string): void;

    getSeverity(): string;
    setSeverity(value: string): void;

    getIntroduced(): string;
    setIntroduced(value: string): void;

    getReported(): string;
    setReported(value: string): void;

    getPatched(): string;
    setPatched(value: string): void;

    getSource(): string;
    setSource(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Vulnerabilities.AsObject;
    static toObject(includeInstance: boolean, msg: Vulnerabilities): Vulnerabilities.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Vulnerabilities, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Vulnerabilities;
    static deserializeBinaryFromReader(message: Vulnerabilities, reader: jspb.BinaryReader): Vulnerabilities;
  }

  export namespace Vulnerabilities {
    export type AsObject = {
      id: string,
      cve: string,
      url: string,
      summary: string,
      severity: string,
      introduced: string,
      reported: string,
      patched: string,
      source: string,
    }
  }

  export class Purls extends jspb.Message {
    getPurl(): string;
    setPurl(value: string): void;

    clearVulnerabilitiesList(): void;
    getVulnerabilitiesList(): Array<VulnerabilityResponse.Vulnerabilities>;
    setVulnerabilitiesList(value: Array<VulnerabilityResponse.Vulnerabilities>): void;
    addVulnerabilities(value?: VulnerabilityResponse.Vulnerabilities, index?: number): VulnerabilityResponse.Vulnerabilities;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Purls.AsObject;
    static toObject(includeInstance: boolean, msg: Purls): Purls.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Purls, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Purls;
    static deserializeBinaryFromReader(message: Purls, reader: jspb.BinaryReader): Purls;
  }

  export namespace Purls {
    export type AsObject = {
      purl: string,
      vulnerabilitiesList: Array<VulnerabilityResponse.Vulnerabilities.AsObject>,
    }
  }
}

