export interface Inventory {
  id?: number;
  compid: number;
  purl: string;
  version: string;
  usage: string;
  notes: string;
  url: string;
  license_name: string;
  files: [];
}
export interface Component {
  id?: number;
  purl: string;
  name: string;
  version: string;
  vendor?: string;
  url: string;
  description?: string;
}
export interface License {
  id: number;
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
