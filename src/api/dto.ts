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
