import { ExportResultsInfo, ExportStatusCode } from '../../../api/types';

export interface IExportResult {
  success: boolean;
  message: string;
  extension: string;
  file: string;
  statusCode: ExportStatusCode;
  info: ExportResultsInfo;
}
