export interface Inventory {
  id?: number;
  compid: number;
  component: Component | string;
  purl: string;
  version: string;
  usage: string;
  notes: string;
  url: string;
  license_name: string;
  files: any[];
}

export interface Component {
  compid?: number;
  purl: string;
  name: string;
  version: string;
  vendor: string;
  url: string;
  description: string;
  summary?: {
    pending: number;
    ignored: number;
    identified: number;
  };
  licenses: any[];
}

export interface License {
  id?: number;
  name: string;
  spdxid: string;
  url: string;
  fulltext: string;
}

export interface NewComponentDTO {
  name: string;
  version: string;
  license_name: string;
  license_id: number;
  purl: string;
  url: string;
}
export interface ItemInclude {
  path: string;
  recursive: boolean;
  action: boolean;
}

export interface IProject {
  work_root: string;
  scan_root: string;
  default_licenses: string;
  default_components: string;
  appVersion: string;
}

export interface Files {
  md5?: string;
  ignored: string;
  pending: string;
  identified: string;
  path: string;
}

export interface ComponentGroup {
  purl: string;
  name: string;
  vendor: string;
  url: string;
  versions: any[];
  summary?: {
    pending: number;
    ignored: number;
    identified: number;
  };
}

export enum FileType {
  BINARY = 'binary',
}
