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
