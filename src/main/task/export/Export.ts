/* eslint-disable no-async-promise-executor */

import { NewExportDTO, SourceType } from 'api/dto';
import { Format } from '../../modules/export/Format';
import { Spdxv20 } from '../../modules/export/format/Spdxv20';
import { Csv } from '../../modules/export/format/Csv';
import { Raw } from '../../modules/export/format/Raw';
import { Wfp } from '../../modules/export/format/Wfp';
import { HtmlSummary } from '../../modules/export/format/HtmlSummary';
import { ITask } from '../Task';
import { IExportResult } from '../../modules/export/IExportResult';
import { ExportFormat, ExportSource, InventoryType } from '../../../api/types';
import { Crypto } from '../../modules/export/format/Crypto';
import { workspace } from '../../workspace/Workspace';
import { ExportRepositorySqliteImp } from '../../modules/export/Repository/ExportRepositorySqliteImp';
import { CycloneDXDetected } from '../../modules/export/format/CycloneDX/CycloneDXDetected';
import { CycloneDXIdentified } from '../../modules/export/format/CycloneDX/CycloneDxIdentified';
import { SpdxLiteDetected } from '../../modules/export/format/SPDXLite/SpdxLiteDetected';
import { SpdxLiteIdentified } from '../../modules/export/format/SPDXLite/SpdxLiteIdentified';
import { ScanossJson } from '../../modules/export/format/ScanossJson';

export class Export implements ITask<string, IExportResult> {
  private format: Format;

  public async run(path: string): Promise<IExportResult> {
    const result = await this.format.save(path);
    return result;
  }

  public async generate() {
    const data = await this.format.generate();
    return data;
  }

  public setFormat(exportDTO: NewExportDTO) {
    switch (exportDTO.format as ExportFormat) {
      case ExportFormat.SPDX20:
        this.format = new Spdxv20();
        break;
      case ExportFormat.CSV:
        if (exportDTO.inventoryType === InventoryType.SBOM) {
          this.format = new Csv(exportDTO.source);
        }
        if (exportDTO.inventoryType === InventoryType.CRYPTOGRAPHY) {
          this.format = new Crypto(exportDTO.source);
        }
        break;
      case ExportFormat.RAW:
        this.format = new Raw();
        break;
      case ExportFormat.WFP:
        this.format = new Wfp();
        break;
      case ExportFormat.SPDXLITEJSON:
        this.format = exportDTO.source === ExportSource.DETECTED ? new SpdxLiteDetected(exportDTO.source) : new SpdxLiteIdentified(exportDTO.source);
        break;
      case ExportFormat.CYCLONEDX:
        this.format = exportDTO.source === ExportSource.DETECTED ? new CycloneDXDetected(exportDTO.source, workspace.getOpenedProjects()[0], new ExportRepositorySqliteImp()) : new CycloneDXIdentified(exportDTO.source, workspace.getOpenedProjects()[0], new ExportRepositorySqliteImp());
        break;
      case ExportFormat.HTMLSUMMARY:
        this.format = new HtmlSummary(exportDTO.source);
        break;
      case ExportFormat.SCANOSS_JSON:
        this.format = new ScanossJson(exportDTO.source);
        break;
      default:
    }
  }
}
