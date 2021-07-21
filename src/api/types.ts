export interface Inventory {
  id?: number;
  compid: number;
  purl: string;
  version: string;
  usage: string;
  notes: string;
  url: string;
  license_name: string;
  files: string[];
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
export interface ItemInclude {
  path: string;
  recursive: boolean;
  action: boolean;
}

export interface Project {
  work_root: string;
  scan_root: string;
  default_licenses: string;
  default_components: string;
}

export interface Files {
  md5?: string;
  ignored: string;
  pending: string;
  identified: string;
  path: string;
}

