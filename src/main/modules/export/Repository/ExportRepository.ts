import { ExportComponentData } from '../../../model/interfaces/report/ExportComponentData';
import { ScanossJsonComponentData, ScanossJsonFileData } from '../../../model/interfaces/report/ScanossJSONData';

export interface ExportRepository {
  getIdentifiedData(): Promise<ExportComponentData[]>;
  getDetectedData(): Promise<ExportComponentData[]>;
  getRawData();
  getWfpData(): Promise<string>;
  getScanossComponentJsonData(): Promise<Array<ScanossJsonComponentData>>;
  getScanossIgnoredComponentFiles(purls: Array<string>): Promise<Array<ScanossJsonFileData>>;
}
