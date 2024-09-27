import fs from 'fs';
import { FileUsageType } from '@api/types';
import { SettingsComponentData, SettingsFileData, SettingsReplacedComponentFileData } from '../../../model/interfaces/report/SettingsReport';
import { workspace } from '../../../workspace/Workspace';
import { modelProvider } from '../../../services/ModelProvider';
import { ExportComponentData } from '../../../model/interfaces/report/ExportComponentData';
import { ExportRepository } from './ExportRepository';

export interface ExportData {
  inventoryId: number;
  fileId: number;
  usage: FileUsageType;
  notes: string;
  identified_license: string;
  detected_license: string;
  purl: string;
  version: string;
  latest_version: string;
  url: string;
  path: string;
  identified_component: string;
  detected_component: string;
  fulltext?: string;
  official?: number;
}

export class ExportRepositorySqliteImp implements ExportRepository {
  public async getIdentifiedData(): Promise<ExportComponentData[]> {
    return modelProvider.model.report.fetchAllIdentifiedComponents();
  }

  public async getDetectedData(): Promise<ExportComponentData[]> {
    return modelProvider.model.report.fetchAllDetectedComponents();
  }

  public getRawData() {
    return workspace.getOpenedProjects()[0].getResults();
  }

  public async getWfpData(): Promise<string> {
    const data: string = await fs.promises.readFile(
      `${workspace.getOpenedProjects()[0].getMyPath()}/winnowing.wfp`,
      'utf-8',
    );
    return data;
  }

  public async getSettingsComponents(): Promise<Array<SettingsComponentData>> {
    return modelProvider.model.report.getSettingsComponents();
  }

  public async getSettingsIgnoredComponentFiles(purls: Array<string>): Promise<Array<SettingsFileData>> {
    return modelProvider.model.report.getSettingsIgnoredComponentFiles(purls);
  }

  public async getSettingsReplacedComponentFiles(): Promise<Array<SettingsReplacedComponentFileData>> {
    return modelProvider.model.report.getSettingsReplacedComponentFiles();
  }
}
