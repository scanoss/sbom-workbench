export interface IExportResult {
  success: boolean;
  message: string;
  extension: string;
  file: string;
  invalidPurls: string[] | null;
}
