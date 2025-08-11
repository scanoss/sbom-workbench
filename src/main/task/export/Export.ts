/* eslint-disable no-async-promise-executor */
import { NewExportDTO } from 'api/dto';
import { Format } from '../../modules/export/Format';
import { SBOMCsv } from '../../modules/export/format/CSV/SBOM-csv';
import { Raw } from '../../modules/export/format/Raw';
import { Wfp } from '../../modules/export/format/Wfp';
import { HtmlSummary } from '../../modules/export/format/HtmlSummary';
import { ITask } from '../Task';
import { IExportResult } from '../../modules/export/IExportResult';
import { ExportFormat, ExportSource, InventoryType } from '../../../api/types';
import { CryptographyCsv } from '../../modules/export/format/CSV/Cryptography-csv';
import { workspace } from '../../workspace/Workspace';
import { ExportRepositorySqliteImp } from '../../modules/export/Repository/ExportRepositorySqliteImp';
import { CycloneDXDetected } from '../../modules/export/format/CycloneDX/CycloneDXDetected';
import { CycloneDXIdentified } from '../../modules/export/format/CycloneDX/CycloneDXIdentified';
import { SpdxLiteDetected } from '../../modules/export/format/SPDXLite/SpdxLiteDetected';
import { SpdxLiteIdentified } from '../../modules/export/format/SPDXLite/SpdxLiteIdentified';
import { Settings } from '../../modules/export/format/Settings/Settings';
import { VulnerabilityCsv } from '../../modules/export/format/CSV/Vulnerability-csv';

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
      case ExportFormat.CSV:
        switch (exportDTO.inventoryType) {
          case InventoryType.SBOM:
            this.format = new SBOMCsv(exportDTO.source);
            break;
          case InventoryType.CRYPTOGRAPHY:
            this.format = new CryptographyCsv(exportDTO.source, new ExportRepositorySqliteImp());
            break;
          case InventoryType.VULNERABILITY:
            this.format = new VulnerabilityCsv(exportDTO.source, new ExportRepositorySqliteImp());
            break;
          default:
            throw new Error(`Unsupported report type: ${exportDTO.inventoryType} for CSV format`);
        }
        break;
      case ExportFormat.RAW:
        this.format = new Raw();
        break;
      case ExportFormat.WFP:
        this.format = new Wfp();
        break;
      case ExportFormat.SPDXLITEJSON:
        this.format = exportDTO.source === ExportSource.DETECTED
          ? new SpdxLiteDetected(workspace.getOpenedProjects()[0], new ExportRepositorySqliteImp())
          : new SpdxLiteIdentified(workspace.getOpenedProjects()[0], new ExportRepositorySqliteImp());
        break;
      case ExportFormat.BOM:
        const project = workspace.getOpenedProjects()[0];
        switch (exportDTO.inventoryType) {
          case InventoryType.CYLONEDX:
            this.format = exportDTO.source === 'IDENTIFIED'
              ? new CycloneDXIdentified(exportDTO.source, project ,new ExportRepositorySqliteImp())
              : new CycloneDXDetected(exportDTO.source, project ,new ExportRepositorySqliteImp());
            break;
          case InventoryType.CYCLONEDX_WITH_VULNERAVILITIES:
            this.format = exportDTO.source === 'IDENTIFIED'
              ? new CycloneDXIdentified(exportDTO.source, project ,new ExportRepositorySqliteImp())
              : new CycloneDXDetected(exportDTO.source, project ,new ExportRepositorySqliteImp());
            break;
          default:
            throw new Error(`Unsupported report type: ${exportDTO.inventoryType} for BOM format`);
        }
        break;
      case ExportFormat.HTMLSUMMARY:
        this.format = new HtmlSummary(exportDTO.source);
        break;
      case ExportFormat.SETTINGS:
        this.format = new Settings(exportDTO.source);
        break;
      default:
    }
  }
}
