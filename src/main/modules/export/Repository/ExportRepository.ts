import { ExportComponentData } from '../../../model/interfaces/report/ExportComponentData';
import { DecisionData } from '../../../model/interfaces/report/DecisionData';

export interface ExportRepository {
  getIdentifiedData(): Promise<ExportComponentData[]>;
  getDetectedData(): Promise<ExportComponentData[]>;
  getRawData();
  getWfpData(): Promise<string>;
  getDecisionData(): Promise<Array<DecisionData>>;
}
