import { ComponentGroup, Dependency, ExportFormat, ExportSource } from '@api/types';
import { ISearchComponent } from '../main/task/componentCatalog/iComponentCatalog/ISearchComponent';
import { IComponentResult } from '../main/task/componentCatalog/iComponentCatalog/IComponentResult';

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

export interface RestoreAllDependenciesDTO {
  dependencyIds?: number[];
  path?: string;
}

export interface AcceptAllDependeciesDTO {
  dependencies?: Array<Dependency>;
  path?: string;
}

export interface GetFileDTO {
  path?: string;
  id?: number;
}

export interface FileDTO {
  fileId: number;
  path: string;
  type: string;
  status: string;
}

export interface LicenseDTO {
  id: number;
  name: string;
  spdxid: string;
  url: string;
  official: number;
}

export interface NewLicenseDTO {
  id?: number;
  name: string;
  fulltext: string;
  url?: string;
  spdxid?: string;

  is
}

export interface IAppInfo {
  version: string;
  name: string;
  appPath: string;
  work_root: string;
  platform: string;
  arch: string;
}

export type SearchComponentDTO = ISearchComponent;

export type ComponentResultDTO = IComponentResult;

export interface NewExportDTO {
  format: ExportFormat;
  source: ExportSource;
  path: string;
}

export enum SourceType {
  detected = 'detected',
  identified = 'identified',
}

export interface VulnerabilitiesGetAllDTO {
  type: SourceType,
}

export interface NewComponentDTO {
  id?: number;
  name: string;
  versions: {
    version: string;
    licenses?: Array<number>;
  }[];
  purl: string;
  url: string;
  description?: string;
}

export interface NewGlobalComponentDTO {
  id?: number;
  name: string;
  versions: {
    url: string;
    version: string;
    licenses?: Array<number>;
  }[];
  purl: string;

}
