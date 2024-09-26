import { ExportComponentData } from '../../main/model/interfaces/report/ExportComponentData';
import { ScanossJsonComponentData, ScanossJsonFileData, ScanossJsonReplacedComponentFileData } from '../../main/model/interfaces/report/ScanossJSONData';

export class ExportRepositoryMock {
  private mockData: {
    identifiedData?: ExportComponentData[];
    detectedData?: ExportComponentData[];
    rawData?: any;
    wfpData?: string;
    scanossJsonComponentData?: Array<ScanossJsonComponentData>;
    scanossJsonFileData?: Array<ScanossJsonFileData>;
    scanossJsonDetectedComponentData?:Array<ScanossJsonReplacedComponentFileData>
  } = {};

  constructor(mockData: Partial<ExportRepositoryMock['mockData']> = {}) {
    this.mockData = mockData;
    this.mockData.scanossJsonComponentData = [];
    this.mockData.scanossJsonFileData = [];
    this.mockData.scanossJsonDetectedComponentData = [];
  }

  public setMockData(newMockData: Partial<ExportRepositoryMock['mockData']>) {
    this.mockData = { ...this.mockData, ...newMockData };
  }

  public async getIdentifiedData(): Promise<ExportComponentData[]> {
    return new Promise<Array<ExportComponentData>>((resolve) => {
      resolve(this.mockData.identifiedData);
    });
  }

  public async getDetectedData(): Promise<ExportComponentData[]> {
    return new Promise<Array<ExportComponentData>>((resolve) => {
      resolve(this.mockData.detectedData);
    });
  }

  public getRawData() {
    return this.mockData.rawData;
  }

  public getWfpData(): Promise<string> {
    return new Promise<string>((resolve) => {
      resolve(this.mockData.wfpData);
    });
  }

  public getScanossComponentJsonData(): Promise<Array<ScanossJsonComponentData>> {
    return new Promise<Array<ScanossJsonComponentData>>((resolve) => {
      resolve(this.mockData.scanossJsonComponentData);
    });
  }

  public getScanossIgnoredComponentFiles(purls: Array<string>): Promise<Array<ScanossJsonFileData>> {
    return new Promise<Array<ScanossJsonFileData>>((resolve) => {
      resolve(this.mockData.scanossJsonFileData);
    });
  }

  public async getScanossReplacedComponentFiles(): Promise<Array<ScanossJsonReplacedComponentFileData>> {
    return new Promise<Array<ScanossJsonReplacedComponentFileData>>((resolve) => {
      resolve(this.mockData.scanossJsonDetectedComponentData);
    });
  }
}
