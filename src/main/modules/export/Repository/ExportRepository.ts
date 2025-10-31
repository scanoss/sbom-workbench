import { ExportComponentData } from '../../../model/interfaces/report/ExportComponentData';
import { DecisionData } from '../../../model/interfaces/report/DecisionData';
import { ComponentVulnerability } from '../../../model/entity/ComponentVulnerability';
import { LicenseDTO } from '../../../../api/dto';
import { ExportCryptographyData } from '../../../model/interfaces/report/ExportCryptographyData';
import { DataRecord } from '../../../model/interfaces/report/DataRecord';

export interface ExportRepository {
  getIdentifiedData(): Promise<ExportComponentData[]>;
  getDetectedData(): Promise<ExportComponentData[]>;
  getRawData();
  getWfpData(): Promise<string>;
  getDecisionData(): Promise<Array<DecisionData>>;
  getDetectedVulnerability(): Promise<Array<ComponentVulnerability>>;
  getIdentifiedVulnerability(): Promise<Array<ComponentVulnerability>>;
  getAllLicensesWithFullText(): Promise<Array<LicenseDTO>>; // TODO:Change type
  getCBOMDetectedData(): Promise<ExportCryptographyData>;
  getCBOMIdentifiedData(): Promise<ExportCryptographyData>;
  getAllIdentifiedRecordFiles(): Promise<Array<DataRecord>>;
  getAllDetectedRecordFiles(): Promise<Array<DataRecord>>;
}
