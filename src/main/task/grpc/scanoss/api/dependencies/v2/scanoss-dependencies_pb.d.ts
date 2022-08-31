// package: scanoss.api.dependencies.v2
// file: scanoss/api/dependencies/v2/scanoss-dependencies.proto

import * as jspb from "google-protobuf";
import * as scanoss_api_common_v2_scanoss_common_pb from "../../../../scanoss/api/common/v2/scanoss-common_pb";

export class DependencyRequest extends jspb.Message {
  clearFilesList(): void;
  getFilesList(): Array<DependencyRequest.Files>;
  setFilesList(value: Array<DependencyRequest.Files>): void;
  addFiles(value?: DependencyRequest.Files, index?: number): DependencyRequest.Files;

  getDepth(): number;
  setDepth(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DependencyRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DependencyRequest): DependencyRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DependencyRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DependencyRequest;
  static deserializeBinaryFromReader(message: DependencyRequest, reader: jspb.BinaryReader): DependencyRequest;
}

export namespace DependencyRequest {
  export type AsObject = {
    filesList: Array<DependencyRequest.Files.AsObject>,
    depth: number,
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

  export class Files extends jspb.Message {
    getFile(): string;
    setFile(value: string): void;

    clearPurlsList(): void;
    getPurlsList(): Array<DependencyRequest.Purls>;
    setPurlsList(value: Array<DependencyRequest.Purls>): void;
    addPurls(value?: DependencyRequest.Purls, index?: number): DependencyRequest.Purls;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Files.AsObject;
    static toObject(includeInstance: boolean, msg: Files): Files.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Files, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Files;
    static deserializeBinaryFromReader(message: Files, reader: jspb.BinaryReader): Files;
  }

  export namespace Files {
    export type AsObject = {
      file: string,
      purlsList: Array<DependencyRequest.Purls.AsObject>,
    }
  }
}

export class DependencyResponse extends jspb.Message {
  clearFilesList(): void;
  getFilesList(): Array<DependencyResponse.Files>;
  setFilesList(value: Array<DependencyResponse.Files>): void;
  addFiles(value?: DependencyResponse.Files, index?: number): DependencyResponse.Files;

  hasStatus(): boolean;
  clearStatus(): void;
  getStatus(): scanoss_api_common_v2_scanoss_common_pb.StatusResponse | undefined;
  setStatus(value?: scanoss_api_common_v2_scanoss_common_pb.StatusResponse): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DependencyResponse.AsObject;
  static toObject(includeInstance: boolean, msg: DependencyResponse): DependencyResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DependencyResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DependencyResponse;
  static deserializeBinaryFromReader(message: DependencyResponse, reader: jspb.BinaryReader): DependencyResponse;
}

export namespace DependencyResponse {
  export type AsObject = {
    filesList: Array<DependencyResponse.Files.AsObject>,
    status?: scanoss_api_common_v2_scanoss_common_pb.StatusResponse.AsObject,
  }

  export class Licenses extends jspb.Message {
    getName(): string;
    setName(value: string): void;

    getSpdxId(): string;
    setSpdxId(value: string): void;

    getIsSpdxApproved(): boolean;
    setIsSpdxApproved(value: boolean): void;

    getUrl(): string;
    setUrl(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Licenses.AsObject;
    static toObject(includeInstance: boolean, msg: Licenses): Licenses.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Licenses, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Licenses;
    static deserializeBinaryFromReader(message: Licenses, reader: jspb.BinaryReader): Licenses;
  }

  export namespace Licenses {
    export type AsObject = {
      name: string,
      spdxId: string,
      isSpdxApproved: boolean,
      url: string,
    }
  }

  export class Dependencies extends jspb.Message {
    getComponent(): string;
    setComponent(value: string): void;

    getPurl(): string;
    setPurl(value: string): void;

    getVersion(): string;
    setVersion(value: string): void;

    clearLicensesList(): void;
    getLicensesList(): Array<DependencyResponse.Licenses>;
    setLicensesList(value: Array<DependencyResponse.Licenses>): void;
    addLicenses(value?: DependencyResponse.Licenses, index?: number): DependencyResponse.Licenses;

    getUrl(): string;
    setUrl(value: string): void;

    getComment(): string;
    setComment(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Dependencies.AsObject;
    static toObject(includeInstance: boolean, msg: Dependencies): Dependencies.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Dependencies, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Dependencies;
    static deserializeBinaryFromReader(message: Dependencies, reader: jspb.BinaryReader): Dependencies;
  }

  export namespace Dependencies {
    export type AsObject = {
      component: string,
      purl: string,
      version: string,
      licensesList: Array<DependencyResponse.Licenses.AsObject>,
      url: string,
      comment: string,
    }
  }

  export class Files extends jspb.Message {
    getFile(): string;
    setFile(value: string): void;

    getId(): string;
    setId(value: string): void;

    getStatus(): string;
    setStatus(value: string): void;

    clearDependenciesList(): void;
    getDependenciesList(): Array<DependencyResponse.Dependencies>;
    setDependenciesList(value: Array<DependencyResponse.Dependencies>): void;
    addDependencies(value?: DependencyResponse.Dependencies, index?: number): DependencyResponse.Dependencies;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Files.AsObject;
    static toObject(includeInstance: boolean, msg: Files): Files.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Files, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Files;
    static deserializeBinaryFromReader(message: Files, reader: jspb.BinaryReader): Files;
  }

  export namespace Files {
    export type AsObject = {
      file: string,
      id: string,
      status: string,
      dependenciesList: Array<DependencyResponse.Dependencies.AsObject>,
    }
  }
}

