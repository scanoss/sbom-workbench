export interface ISearchResult{
  id: number;
  type: string;
  path: string;
  identified: number;
  ignored: number;
  matched: string | null;
  lines: string | null;
  oss_lines: string | null;
  file_url: string | null;
  inventoryid: number | null;
  license: string | null;
  componentName: string | null;
  url: string | null;
  purl: string | null;
  version: string | null;
}
