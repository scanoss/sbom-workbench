export interface SettingsComponentData {
  purl: string;
  totalMatchedFiles: number;
  identifiedFiles: number;
  ignoredFiles: number;
  source: 'manual' | 'engine';
}

export interface SettingsFileData {
  purl: string;
  path: string;
}

export interface SettingsReplacedComponentFileData {
  original: string;
  identified: string;
  paths: Array<string>;
}
