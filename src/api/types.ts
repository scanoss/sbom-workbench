export enum ScanState {
  CREATED = 'CREATED',
  READY_TO_SCAN = 'READY_TO_SCAN',
  SCANNING = 'SCANNING',
  SCANNED = 'SCANNED',
}

export enum ProjectState {
  OPENED,
  CLOSED,
}

export interface IProjectCfg {
  DEFAULT_URL_API: string;
  TOKEN: string;
  SCAN_MODE: string;
}

export interface IWorkspaceCfg {
  DEFAULT_API_INDEX: number;
  APIS: Array<Record<string, string>>;
  TOKEN: string;
  SCAN_MODE: string;
  VERSION: string;
}

export interface Inventory {
  id?: number;
  compid: number;
  component: Component;
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
  appVersion: string;
  date: string;
  name: string;
  work_root: string;
  scan_root: string;
  scannerState: ScanState;
  files: number;
  api: string;
  token: string;
  uuid: string;

  default_licenses?: string;
  default_components?: string;
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

export enum HashType {
  SHA256 = 'sha256',
}

export enum FormatVersion {
  SPDX20 = 'SPDX20',
  SPDXLITE = 'SPDXLITE',
  CSV = 'CSV',
  RAW = 'RAW',
  WFP = 'WFP',
  SPDXLITEJSON = 'SPDXLITEJSON',
}
