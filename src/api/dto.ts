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
