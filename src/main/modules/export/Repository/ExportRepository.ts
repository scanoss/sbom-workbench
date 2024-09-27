import { ExportComponentData } from '../../../model/interfaces/report/ExportComponentData';
import { SettingsComponentData, SettingsFileData, SettingsReplacedComponentFileData } from '../../../model/interfaces/report/SettingsReport';

export interface ExportRepository {
  getIdentifiedData(): Promise<ExportComponentData[]>;
  getDetectedData(): Promise<ExportComponentData[]>;
  getRawData();
  getWfpData(): Promise<string>;
  getSettingsComponents(): Promise<Array<SettingsComponentData>>;
  getSettingsIgnoredComponentFiles(purls: Array<string>): Promise<Array<SettingsFileData>>;
  getSettingsReplacedComponentFiles(): Promise<Array<SettingsReplacedComponentFileData>>;
}
