export interface Inventory {
  id?: number;
  compid: number;
  purl: string;
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
  vendor?: string;
  url: string;
  description?: string;
}
export interface License {
  id: number;
}
export interface ItemInclude {
  path: string;
  recursive: boolean;
}
