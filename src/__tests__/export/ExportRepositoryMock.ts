import { ExportRepository } from '../../main/modules/export/Repository/ExportRepository';
import { ExportComponentData } from '../../main/model/interfaces/report/ExportComponentData';
import { SettingsComponentData, SettingsFileData, SettingsReplacedComponentFileData } from '../../main/model/interfaces/report/SettingsReport';

export class ExportRepositoryMock implements ExportRepository {
  private mockData: {
    identifiedData?: ExportComponentData[];
    detectedData?: ExportComponentData[];
    rawData?: any;
    wfpData?: string;
    settingsComponentData?: Array<SettingsComponentData>;
    settingsFileData?: Array<SettingsFileData>;
    settingsDetectedComponentData?:Array<SettingsReplacedComponentFileData>
  } = {};

  constructor(mockData: Partial<ExportRepositoryMock['mockData']> = {}) {
    this.mockData = mockData;
    this.mockData.settingsComponentData = [];
    this.mockData.settingsFileData = [];
    this.mockData.settingsDetectedComponentData = [];
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

  public getSettingsComponents(): Promise<Array<SettingsComponentData>> {
    return new Promise<Array<SettingsComponentData>>((resolve) => {
      resolve(this.mockData.settingsComponentData);
    });
  }

  public getSettingsIgnoredComponentFiles(purls: Array<string>): Promise<Array<SettingsFileData>> {
    return new Promise<Array<SettingsFileData>>((resolve) => {
      resolve(this.mockData.settingsFileData);
    });
  }

  public async getSettingsReplacedComponentFiles(): Promise<Array<SettingsReplacedComponentFileData>> {
    return new Promise<Array<SettingsReplacedComponentFileData>>((resolve) => {
      resolve(this.mockData.settingsDetectedComponentData);
    });
  }
}
