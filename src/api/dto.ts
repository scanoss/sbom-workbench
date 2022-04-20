import {Dependency} from "@api/types";

export interface NewDependencyDTO {
  dependencyId?: number;
  purl: string;
  license: string;
  version: string;
}

export interface RejectAllDependeciesDTO {
  dependencyIds?: number[];
  path?: string;
}

export interface AcceptAllDependeciesDTO {
  dependencies?: Array<Dependency>;
  path?: string;
}

export interface GetFileDTO{
  path?: string;
  id?: number;
}

export interface FileDTO{
  fileId: number;
  path: string;
  type: string;
  status: string;
}
