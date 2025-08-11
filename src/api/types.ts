import { IReportData, ISummary, ReportComponent } from 'main/services/ReportService';
import { NodeStatus } from '../main/workspace/tree/Node';
import { Scanner } from '../main/task/scanner/types';
import ScannerConfig = Scanner.ScannerConfig;
import Folder from '../main/workspace/tree/Folder';
import { Metadata } from '../main/workspace/Metadata';
import { CryptographicItem } from '../main/model/entity/Cryptography';



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
  DEFAULT_WORKSPACE_INDEX: number;
  WORKSPACES: Array<WorkspaceData>;
  TOKEN: string;
  SCAN_MODE: string;
  VERSION: string;
  LNG: string;
  HTTP_PROXY: string;   // [http://|https://][<username>[:<password>]@]<IP|domain_name>[:<port>]
  HTTPS_PROXY: string;
  GRPC_PROXY: string;
  PAC_PROXY: string;    //URL
  NO_PROXY: string[];
  CA_CERT: string;
  IGNORE_CERT_ERRORS: boolean;
  SCANNER_TIMEOUT: number;
  SCANNER_POST_SIZE: number;
  SCANNER_CONCURRENCY_LIMIT: number;
  MULTIUSER_LOCK_TIMEOUT: number;
}

export interface WorkspaceData {
  NAME: string;
  PATH: string;
  DESCRIPTION: string;
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
  source: string;
  notes: string;
  url: string;
  license_name: string;
  spdxid: string;
  files: any[];
}

export type AuditSummaryCount = {
  pending: number;
  ignored: number;
  identified: number;
};

export interface Component {
  compid?: number;
  purl: string;
  name: string;
  version: string;
  vendor: string;
  url: string;
  description: string;
  summary?: AuditSummaryCount;
  licenses: any[];
  source: string;
}

export interface DependencyManifestFile {
  path: string;
  fileId: number;
  summary: AuditSummaryCount;
}

export interface License {
  id?: number;
  name: string;
  spdxid: string;
  url: string;
  fulltext: string;
  official?: number;
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
  scannerConfig: ScannerConfig;
}

export interface IProject extends INewProject {
  appVersion: string;
  date: string;
  work_root: string;
  scannerState: ScanState;
  files: number;
  uuid: string;
  source: string;
  scannerConfig: Scanner.ScannerConfig;
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
  BOM = 'BOM',
  HTMLSUMMARY = 'HTMLSUMMARY',
  SETTINGS = 'SETTINGS',
}

export enum ExportSource {
  DETECTED = 'DETECTED',
  IDENTIFIED = 'IDENTIFIED',
}

export enum InventoryType {
  SBOM = 'SBOM',
  CRYPTOGRAPHY = 'CRYPTOGRAPHY',
  VULNERABILITY = 'VULNERABILITY',
  CYLONEDX = 'CYCLONEDX',
  CYCLONEDX_WITH_VULNERABILITIES = 'CYLONEDX-WITH-VULNERABILITIES',
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
  action?: InventoryAction;
  overwrite: boolean;
  fileStatusType?: FileStatusType;
  source?: {
    type: InventorySourceType;
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
  DEPENDENCY = 'dependency',
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

export interface Result {
  id: number;
  fileId: number;
  md5_file: string;
  vendor: string;
  component: string;
  version: string;
  latest_version: string;
  cpe: string;
  lines: string;
  url: string;
  oss_lines: string;
  matched: string;
  filename: string;
  size: string;
  idtype: string;
  url_hash: string;
  compid: number;
  purl: string;
  file_url: string;
  source: string;
}

export interface Dependency {
  path: string;
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
  rejectedAt?: string
}

export enum ScannerStage {
  UNZIP,
  INDEX,
  SCAN,
  RESCAN,
  RESUME,
  DEPENDENCY,
  VULNERABILITY,
  CRYPTOGRAPHY,
  LOCAL_CRYPTOGRAPHY,
  EXPORT_CONTROL,
  SEARCH_INDEX,
  IMPORT_COMPONENT,
}

export interface InventoryExtraction {
  externalFiles: Array<ExternalFile>;
  purl: string;
  name: string;
  url: string;
  version: string;
  spdxid: string;
  licenseName: string;
  usage: string;
  notes: string;
}

export interface InventoryKnowledgeExtraction {
  [key: string]: {
    inventories: Array<InventoryExtraction>;
    localFiles: Array<string>;
  };
}

export interface ExternalFile {
  projectName: string;
  path: string;
}

export interface ExtractFromProjectDTO {
  override: boolean;
  source: IProject[];
  target: IProject;
  folder: string;
  md5File?: string;
}

export interface ReuseIdentificationTaskDTO {
  inventoryKnowledgeExtraction: InventoryKnowledgeExtraction;
  overwrite: boolean;
  path?: string;
  type: InventorySourceType;
}

export enum ProjectAccessMode {
  READ_ONLY = 'READ_ONLY',
  WRITE = 'WRITE',
}

export interface ProjectOpenResponse {
  logical_tree: Folder;
  work_root: string;
  scan_root: string;
  dependencies: string[];
  uuid: string;
  source: string;
  metadata: Metadata;
  mode: ProjectAccessMode;
  lockedBy: string;
}

export interface LOCK {
  user: string;
  id: {
    mac: string;
    interface: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CryptographyResponseDTO {
  files: Array<CryptographicItem>,
  components: Array<CryptographicItem>
  summary: {
    files: {
      type: Record<string, number>;
      crypto: Record<string, number>;
      typeDetection: Record<string, Array<string>>;
    },
    components:{
      type: Record<string, number>;
      crypto: Record<string, number>;
      typeDetection: Record<string, Array<string>>;
    }
  },
}

/* Report Handler */
export type ReportSummary = ISummary;
export type ReportData = IReportData;

export interface ContextFiles {
  identifyFile: string | null;
  ignoreFile: string | null;
}

export interface DependencyManifestFile {
  path: string;
  fileId: number;
  summary: {
    identified: number
    ignored: number;
    pending: number;
  }
}

export interface GroupSearchKeyword {
  id: number;
  label: string;
  words: Array<string>;
  createdAt: string;
  updatedAt:string;
}

export interface ComponentReportResponse {
  components:ReportComponent[];
  declaredComponents: ReportComponent[];
}

export interface LicenseObligation {
  checklist_url: string;
  copyleft: string;
  incompatible_with: string;
  osadl_updated: string;
  patent_hints: string;
  label?: string;
}

export enum ExportStatusCode {
  SUCCESS = 'SUCCESS',
  SUCCESS_WITH_WARNINGS = 'SUCCESS_WITH_WARNINGS',
  FAILED = 'FAILED',
}

export interface ExportResultsInfo {
  invalidPurls: Array<string>;
}




export enum ProjectSource {
  /** Project created from imported files */
  IMPORTED = 'IMPORTED',
  /** Project created from direct scanning */
  SCAN = 'SCAN',
  /** Project created from imported scan results. result.json */
  IMPORT_SCAN_RESULTS = 'IMPORT_SCAN_RESULTS'
}
