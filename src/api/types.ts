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
}

export interface IProject extends INewProject {
  appVersion: string;
  date: string;
  work_root: string;
  scannerState: ScanState;
  files: number;
  uuid: string;
  db: IDb;
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

export interface IFolderInventory {
  folder: string;
  action: InventoryAction;
  overwrite: boolean;
  data?: Partial<Inventory>;
}

export interface ComponentParams {
  source?: ComponentSource;
  path?: string;
}

export enum ComponentSource {
  ENGINE = 'engine',
}

export interface IComponentDb {
  get(id: number): Promise<Component>;
  create(component: any): Promise<Component>;
  getLicensesAttachedToComponentsFromResults(): Promise<Array<any>>;
  getUniqueComponentsFromResults(): Promise<Array<Partial<Component>>>;
  import(components: Array<Partial<Component>>): Promise<void>;
  getbyPurlVersion(data: any);
  getByPurl(data: any, params: ComponentParams);
  allComp(params: ComponentParams | null);
  getSummaryByPath(path: string, purls: string[]): Promise<Array<any>>;
  summaryByPurl(data: any);
}
export interface ILicenseDb {
  bulkAttachComponentLicense(data: any): Promise<void>;
}

export interface IFilesDb {
  getByPurlVersion(data: Partial<Component>, path: string);
  getByPurl(data: Partial<Component>, path: string);
  restore(files: number[]): Promise<void>;
  identified(id: number[]): Promise<void>;
}

export interface IInventoryDb {
  getAll();
  getInventoryFiles(inventory: Partial<Inventory>): Promise<Files>;
  getById(id: number): Promise<Inventory>;
  emptyInventory();
  detachFileInventory(inventory: Partial<Inventory>): Promise<void>;
  deleteAllEmpty(id: number[]): Promise<void>;
  isInventory(inventory): Promise<Partial<Inventory>>;
  create(inventory: Partial<Inventory>): Promise<Partial<Inventory>>;
  createBatch(inventories: Array<Partial<Inventory>>): Promise<Array<Inventory>>;
  attachFileInventoryBatch(data: any): Promise<boolean>;
  getByPurlVersion(inventory: Partial<Inventory>);
  getByResultId(inventory: Partial<Inventory>);
  getByPurl(inventory: Partial<Inventory>);
  attachFileInventory(inventory: Partial<Inventory>): Promise<boolean>;
}

export interface IDb {
  components: IComponentDb;
  licenses: ILicenseDb;
  inventories: IInventoryDb;
  files: IFilesDb;
}
