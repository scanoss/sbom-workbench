import { ExportRepository } from '../../main/modules/export/Repository/ExportRepository';
import { ExportComponentData } from '../../main/model/interfaces/report/ExportComponentData';
import { DecisionData } from '../../main/model/interfaces/report/DecisionData';
import { ComponentVulnerability } from '../../main/model/entity/ComponentVulnerability';
import { detectedVulnerabilityData, identifiedVulnerabilityData } from './mocks/vulnerability.model.mock';
import { LicenseDTO } from '@api/dto';
import { undefined } from 'zod';
import { licenses } from '@assets/data/licenses';

export class ExportRepositoryMock implements ExportRepository {
  private mockDecisionData: Array<DecisionData>;

  private detectedVulnerabilityData: Array<ComponentVulnerability>;

  private identifiedVulnerabilityData: Array<ComponentVulnerability>;

  constructor() {
    this.mockDecisionData = [];
    this.detectedVulnerabilityData = detectedVulnerabilityData;
    this.identifiedVulnerabilityData = identifiedVulnerabilityData;
  }

  public setDecisionMockData(data: Array<DecisionData>) {
    this.mockDecisionData = data;
  }

  public setIdentifiedMockData(data: Array<ComponentVulnerability>) {
    this.identifiedVulnerabilityData = data;
  }

  public setDetectedVulnerabilityData(data: Array<ComponentVulnerability>) {
    this.detectedVulnerabilityData = data;
  }

  public async getDecisionData(): Promise<Array<DecisionData>> {
    return new Promise<Array<DecisionData>>((resolve) => {
      resolve(this.mockDecisionData);
    });
  }

  getDetectedData(): Promise<ExportComponentData[]> {
    return Promise.resolve([]);
  }

  getIdentifiedData(): Promise<ExportComponentData[]> {
    return Promise.resolve([]);
  }

  getRawData() {
  }

  getWfpData(): Promise<string> {
    return Promise.resolve('');
  }

  getDetectedVulnerability(): Promise<Array<ComponentVulnerability>> {
    return Promise.resolve(this.detectedVulnerabilityData);
  }

  getIdentifiedVulnerability(): Promise<Array<ComponentVulnerability>> {
    return Promise.resolve(this.identifiedVulnerabilityData);
  }

  getAllLicensesWithFullText(): Promise<Array<LicenseDTO>> {
    return Promise.resolve(licenses as unknown as LicenseDTO[]);
  }
}
