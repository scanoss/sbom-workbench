export interface Bom {
  include: BomItem[];
  remove: BomItem[];
  replace: ReplaceBomItem[];
}

export interface BomItem {
  purl: string;
  path?: string;
}

export interface ReplaceBomItem {
  purl: string;
  replace_with: string;
  paths: string[];
}
