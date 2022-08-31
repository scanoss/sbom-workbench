// package: scanoss.api.components.v2
// file: scanoss/api/components/v2/scanoss-components.proto

import * as jspb from "google-protobuf";
import * as scanoss_api_common_v2_scanoss_common_pb from "../../../../scanoss/api/common/v2/scanoss-common_pb";

export class CompSearchRequest extends jspb.Message {
  getSearch(): string;
  setSearch(value: string): void;

  getVendor(): string;
  setVendor(value: string): void;

  getComponent(): string;
  setComponent(value: string): void;

  getPackage(): string;
  setPackage(value: string): void;

  getLimit(): number;
  setLimit(value: number): void;

  getOffset(): number;
  setOffset(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CompSearchRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CompSearchRequest): CompSearchRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CompSearchRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CompSearchRequest;
  static deserializeBinaryFromReader(message: CompSearchRequest, reader: jspb.BinaryReader): CompSearchRequest;
}

export namespace CompSearchRequest {
  export type AsObject = {
    search: string,
    vendor: string,
    component: string,
    pb_package: string,
    limit: number,
    offset: number,
  }
}

export class CompSearchResponse extends jspb.Message {
  clearComponentsList(): void;
  getComponentsList(): Array<CompSearchResponse.Component>;
  setComponentsList(value: Array<CompSearchResponse.Component>): void;
  addComponents(value?: CompSearchResponse.Component, index?: number): CompSearchResponse.Component;

  hasStatus(): boolean;
  clearStatus(): void;
  getStatus(): scanoss_api_common_v2_scanoss_common_pb.StatusResponse | undefined;
  setStatus(value?: scanoss_api_common_v2_scanoss_common_pb.StatusResponse): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CompSearchResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CompSearchResponse): CompSearchResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CompSearchResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CompSearchResponse;
  static deserializeBinaryFromReader(message: CompSearchResponse, reader: jspb.BinaryReader): CompSearchResponse;
}

export namespace CompSearchResponse {
  export type AsObject = {
    componentsList: Array<CompSearchResponse.Component.AsObject>,
    status?: scanoss_api_common_v2_scanoss_common_pb.StatusResponse.AsObject,
  }

  export class Component extends jspb.Message {
    getComponent(): string;
    setComponent(value: string): void;

    getPurl(): string;
    setPurl(value: string): void;

    getUrl(): string;
    setUrl(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Component.AsObject;
    static toObject(includeInstance: boolean, msg: Component): Component.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Component, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Component;
    static deserializeBinaryFromReader(message: Component, reader: jspb.BinaryReader): Component;
  }

  export namespace Component {
    export type AsObject = {
      component: string,
      purl: string,
      url: string,
    }
  }
}

export class CompVersionRequest extends jspb.Message {
  getPurl(): string;
  setPurl(value: string): void;

  getLimit(): number;
  setLimit(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CompVersionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CompVersionRequest): CompVersionRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CompVersionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CompVersionRequest;
  static deserializeBinaryFromReader(message: CompVersionRequest, reader: jspb.BinaryReader): CompVersionRequest;
}

export namespace CompVersionRequest {
  export type AsObject = {
    purl: string,
    limit: number,
  }
}

export class CompVersionResponse extends jspb.Message {
  hasComponent(): boolean;
  clearComponent(): void;
  getComponent(): CompVersionResponse.Component | undefined;
  setComponent(value?: CompVersionResponse.Component): void;

  hasStatus(): boolean;
  clearStatus(): void;
  getStatus(): scanoss_api_common_v2_scanoss_common_pb.StatusResponse | undefined;
  setStatus(value?: scanoss_api_common_v2_scanoss_common_pb.StatusResponse): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CompVersionResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CompVersionResponse): CompVersionResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CompVersionResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CompVersionResponse;
  static deserializeBinaryFromReader(message: CompVersionResponse, reader: jspb.BinaryReader): CompVersionResponse;
}

export namespace CompVersionResponse {
  export type AsObject = {
    component?: CompVersionResponse.Component.AsObject,
    status?: scanoss_api_common_v2_scanoss_common_pb.StatusResponse.AsObject,
  }

  export class License extends jspb.Message {
    getName(): string;
    setName(value: string): void;

    getSpdxId(): string;
    setSpdxId(value: string): void;

    getIsSpdxApproved(): boolean;
    setIsSpdxApproved(value: boolean): void;

    getUrl(): string;
    setUrl(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): License.AsObject;
    static toObject(includeInstance: boolean, msg: License): License.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: License, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): License;
    static deserializeBinaryFromReader(message: License, reader: jspb.BinaryReader): License;
  }

  export namespace License {
    export type AsObject = {
      name: string,
      spdxId: string,
      isSpdxApproved: boolean,
      url: string,
    }
  }

  export class Version extends jspb.Message {
    getVersion(): string;
    setVersion(value: string): void;

    clearLicensesList(): void;
    getLicensesList(): Array<CompVersionResponse.License>;
    setLicensesList(value: Array<CompVersionResponse.License>): void;
    addLicenses(value?: CompVersionResponse.License, index?: number): CompVersionResponse.License;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Version.AsObject;
    static toObject(includeInstance: boolean, msg: Version): Version.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Version, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Version;
    static deserializeBinaryFromReader(message: Version, reader: jspb.BinaryReader): Version;
  }

  export namespace Version {
    export type AsObject = {
      version: string,
      licensesList: Array<CompVersionResponse.License.AsObject>,
    }
  }

  export class Component extends jspb.Message {
    getComponent(): string;
    setComponent(value: string): void;

    getPurl(): string;
    setPurl(value: string): void;

    getUrl(): string;
    setUrl(value: string): void;

    clearVersionsList(): void;
    getVersionsList(): Array<CompVersionResponse.Version>;
    setVersionsList(value: Array<CompVersionResponse.Version>): void;
    addVersions(value?: CompVersionResponse.Version, index?: number): CompVersionResponse.Version;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Component.AsObject;
    static toObject(includeInstance: boolean, msg: Component): Component.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Component, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Component;
    static deserializeBinaryFromReader(message: Component, reader: jspb.BinaryReader): Component;
  }

  export namespace Component {
    export type AsObject = {
      component: string,
      purl: string,
      url: string,
      versionsList: Array<CompVersionResponse.Version.AsObject>,
    }
  }
}

