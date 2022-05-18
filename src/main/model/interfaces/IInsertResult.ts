export interface IInsertResult {
  [key: string]: Array<IResultLicense>
}

export interface IResultLicense {
  name: string;
  patent_hints: string;
  copyleft: string;
  checklist_url: string;
  incompatible_with: string;
  osadl_updated: Date;
  source: string;
  url: string;
}
