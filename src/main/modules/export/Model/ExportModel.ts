import fs from 'fs';
import { FileUsageType } from '@api/types';
import { workspace } from '../../../workspace/Workspace';
import { modelProvider } from '../../../services/ModelProvider';
import { ExportComponentData } from '../../../model/interfaces/report/ExportComponentData';
import { ScanossJsonComponentData } from 'main/model/interfaces/report/ScanossJSONData';

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

export class ExportModel {
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

  public async getScanossComponentJsonData(): Promise<Array<ScanossJsonComponentData>> {
    return modelProvider.model.report.getScanossJsonComponents();
  }

  public async getScanossIgnoredComponentFiles(purls: Array<string>): Promise<Array<ScanossJsonComponentData>> {
    return modelProvider.model.report.getScanossJsonIgnoredComponentFiles(purls);
  }
}
