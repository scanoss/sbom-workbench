import { NodeStatus } from '../main/workspace/tree/Node';

export enum ScanState {
  CREATED = 'CREATED',
  READY_TO_SCAN = 'READY_TO_SCAN',
  SCANNING = 'SCANNING',
  RESCANNING = 'RESCANNING',
  FINISHED = 'FINISHED',
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

export interface Node {
  type: 'folder' | 'file';
  path: string;
}

export interface Inventory {
  id?: number;
  cvid: number;
  component: Component;
  purl: string;
  version: string;
  usage: string;
  notes: string;
  url: string;
  license_name: string;
  spdxid: string;
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
  source: string;
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

export interface INewProject {
  name: string;
  scan_root: string;
  default_license: string;
  default_components?: string;
  api?: string;
  token?: string;
  api_key?: string;
  source: string;
}

export interface IProject extends INewProject {
  appVersion: string;
  date: string;
  work_root: string;
  scannerState: ScanState;
  files: number;
  uuid: string;
  source: string;
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
  identifiedAs: {
    name: string;
    purl: string;
  }[];
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

export enum ExportFormat {
  SPDX20 = 'SPDX20',
  SPDXLITE = 'SPDXLITE',
  CSV = 'CSV',
  RAW = 'RAW',
  WFP = 'WFP',
  SPDXLITEJSON = 'SPDXLITEJSON',
  HTMLSUMMARY = 'HTMLSUMMARY',
}

export type IParams = Record<PropertyKey, any> & {
  // non-generic interface properties go here
  sort?: string;
  order?: string;
};

export enum InventoryAction {
  IGNORE = 'IGNORE',
  IDENTIFY = 'IDENTIFY',
  RESTORE = 'RESTORE',
  ACCEPT = 'ACCEPT',
}

export enum InventorySourceType {
  PATH = 'PATH',
  FILE = 'FILE',
}

export interface IBatchInventory {
  action: InventoryAction;
  overwrite: boolean;
  source: {
    type: InventorySourceType ;
    input: any;
  };
  data?: {
    inventory?: Partial<Inventory>;
    inventories?: Partial<Inventory[]>;
    notes?: string;
  };
}

export interface IWorkbenchFilter {
  source?: ComponentSource;
  path?: string;
  usage?: FileUsageType;
  status?: FileStatusType;
  purl?: string;
  filename?: string;
}

export interface IWorkbenchFilterParams {
  filter?: IWorkbenchFilter;
  unique?: boolean;
}

export enum FileStatusType {
  PENDING = 'pending',
  ORIGINAL = 'original',
  IDENTIFIED = 'identified',
  FILTERED = 'filtered',
  NOMATCH = 'nomatch',
}

export enum FileUsageType {
  SNIPPET = 'snippet',
  FILE = 'file',
}

export enum ComponentSource {
  ENGINE = 'engine',
}

export interface File {
  fileId: number;
  path: string;
  identified: number;
  ignored: number;
  dirty: number;
  type: NodeStatus;
}

export enum FileTreeViewMode {
  DEFAULT,
  PRUNE,
}

export interface Dependency {
  dependencyId: number;
  fileId: number;
  licenses: string[];
  purl: string;
  version: string;
  scope: string;
  componentName: string;
  component: Component;
  status: FileStatusType.IDENTIFIED | FileStatusType.ORIGINAL | FileStatusType.PENDING;
  inventory: Inventory;
  valid: boolean;
  originalVersion: string;
  originalLicense: string[];
}
