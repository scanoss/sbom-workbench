import { ExportRepository } from '../../main/modules/export/Repository/ExportRepository';
import { ExportComponentData } from '../../main/model/interfaces/report/ExportComponentData';
import { DecisionData } from '../../main/model/interfaces/report/DecisionData';

export class ExportRepositoryMock implements ExportRepository {

  private mockDecisionData: Array<DecisionData>;


  constructor() {
    this.mockDecisionData = [];
  }

  public setDecisionMockData(data: Array<DecisionData>) {
    this.mockDecisionData = data;
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
}
