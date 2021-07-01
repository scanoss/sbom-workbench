export interface Inventory {
  id?: number;
  purl: string;
  version: string;
  url: string;
  license_name: string;
  usage: string;
  notes: string;
  files?: string[];
}
