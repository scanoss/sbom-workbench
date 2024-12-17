export interface Bom {
  include: BomItem[];
  remove: BomItem[];
  replace: ReplaceBomItem[];
}

export interface BomItem {
  purl: string;
  path?: string;
}

export interface ReplaceBomItem extends BomItem {
  replace_with: string;
}
