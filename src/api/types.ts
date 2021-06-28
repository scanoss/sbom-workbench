export interface Inventory {
  id?: number;
  purl: string;
  usage: string;
  notes: string;
  url: string;
  license_name: string;
  files: string[];
}
