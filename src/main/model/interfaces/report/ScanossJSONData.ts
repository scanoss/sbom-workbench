export interface ScanossJsonComponentData {
  purl: string;
  totalMatchedFiles: number;
  identifiedFiles: number;
  ignoredFiles: number;
}

export interface ScanossJsonFileData {
  purl: string;
  path: string;
}
