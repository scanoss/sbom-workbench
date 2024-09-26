export interface ScanossJsonComponentData {
  purl: string;
  totalMatchedFiles: number;
  identifiedFiles: number;
  ignoredFiles: number;
  source: 'manual' | 'engine';
}

export interface ScanossJsonFileData {
  purl: string;
  path: string;
}

export interface ScanossJsonReplacedComponentFileData {
  original: string;
  identified: string;
  paths: Array<string>;
}
