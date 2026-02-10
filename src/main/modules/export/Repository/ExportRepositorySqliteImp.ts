import fs from 'fs';
import { ExportSource, FileUsageType } from '@api/types';
import { undefined } from 'zod';
import { workspace } from '../../../workspace/Workspace';
import { modelProvider } from '../../../services/ModelProvider';
import { ExportComponentData } from '../../../model/interfaces/report/ExportComponentData';
import { ExportRepository } from './ExportRepository';
import { DecisionData } from '../../../model/interfaces/report/DecisionData';
import { ComponentVulnerability } from '../../../model/entity/ComponentVulnerability';
import { LicenseDTO } from '../../../../api/dto';
import { CryptographicItem } from '../../../model/entity/Cryptography';
import { ExportCryptographyData } from '../../../model/interfaces/report/ExportCryptographyData';
import { DataRecord } from '../../../model/interfaces/report/DataRecord';
import path from 'path';

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

  public getRawFilePath(): string {
    return path.join(`${workspace.getOpenedProjects()[0].getMyPath()}`, '/result.json');
  }

  public async getWfpData(): Promise<string> {
    const data: string = await fs.promises.readFile(
      `${workspace.getOpenedProjects()[0].getMyPath()}/winnowing.wfp`,
      'utf-8',
    );
    return data;
  }

  public async getDecisionData(): Promise<Array<DecisionData>> {
    return modelProvider.model.report.getDecisionData();
  }

  public async getIdentifiedVulnerability(): Promise<Array<ComponentVulnerability>> {
    return modelProvider.model.vulnerability.getAllIdentified();
  }

  public async getDetectedVulnerability(): Promise<Array<ComponentVulnerability>> {
    return modelProvider.model.vulnerability.getAllDetected();
  }

  public async getAllLicensesWithFullText(): Promise<Array<LicenseDTO>> {
    return modelProvider.model.license.getAllWithFullText();
  }

  public async getCBOMDetectedData(): Promise<ExportCryptographyData> {
    const localCrypto = await modelProvider.model.localCryptography.findAllDetectedGroupByType();
    const componentCrypto = await modelProvider.model.cryptography.findAllDetectedGroupByType();
    return {
      localCryptography: localCrypto,
      componentCryptography: componentCrypto,
    };
  }

  public async getCBOMIdentifiedData(): Promise<ExportCryptographyData> {
    const localCrypto = await modelProvider.model.localCryptography.findAllDetectedGroupByType(); // Detected Local Cryptography is considered Identified in CBOM
    const componentCrypto = await modelProvider.model.cryptography.findAllIdentifiedGroupByType();
    return {
      localCryptography: localCrypto,
      componentCryptography: componentCrypto,
    };
  }

  public async getAllDetectedRecordFiles(): Promise<Array<DataRecord>>{
    return modelProvider.model.report.fetchAllDetectedRecordsFiles();
  }

  public async getAllIdentifiedRecordFiles(): Promise<Array<DataRecord>>{
    return modelProvider.model.report.fetchAllIdentifiedRecordsFiles();
  }
}
