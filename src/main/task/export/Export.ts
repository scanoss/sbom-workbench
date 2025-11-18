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

  public setFormat(exportDTO: NewExportDTO): void {
    const project = workspace.getOpenedProjects()[0];

    switch (exportDTO.format as ExportFormat) {
      case ExportFormat.CSV:
        this.setCsvFormat(exportDTO);
        break;
      case ExportFormat.RAW:
        this.format = new Raw();
        break;
      case ExportFormat.WFP:
        this.format = new Wfp();
        break;
      case ExportFormat.BOM:
        this.setBomFormat(exportDTO, project);
        break;
      case ExportFormat.HTMLSUMMARY:
        this.format = new HtmlSummary(exportDTO.source);
        break;
      case ExportFormat.SETTINGS:
        this.format = new Settings(exportDTO.source);
        break;
      default:
        throw new Error(`Unsupported export format: ${exportDTO.format}`);
    }
    this.format.setOutputPath(exportDTO.path);
  }

  private setCsvFormat(exportDTO: NewExportDTO): void {
    switch (exportDTO.inventoryType) {
      case InventoryType.SBOM:
        this.format = new SBOMCsv(exportDTO.source);
        break;
      case InventoryType.CRYPTOGRAPHY:
        this.format = new CryptographyCsv(exportDTO.source);
        break;
      case InventoryType.VULNERABILITY:
        this.format = new VulnerabilityCsv(exportDTO.source);
        break;
      default:
        throw new Error(`Unsupported inventory type: ${exportDTO.inventoryType} for CSV format`);
    }
  }

  private setBomFormat(exportDTO: NewExportDTO, project: any): void {
    const isIdentified = exportDTO.source === ExportSource.IDENTIFIED;

    switch (exportDTO.inventoryType) {
      case InventoryType.CYLONEDX:
        this.format = isIdentified
          ? new CycloneDXIdentified(project)
          : new CycloneDXDetected(project);
        break;
      case InventoryType.CYCLONEDX_WITH_VULNERABILITIES:
        this.format = isIdentified
          ? new CycloneDXIdentified(project, undefined, true)
          : new CycloneDXDetected(project, undefined, true);
        break;
      case InventoryType.SPDXLITE:
        this.format = exportDTO.source === ExportSource.DETECTED
          ? new SpdxLiteDetected(project)
          : new SpdxLiteIdentified(project);
        break;
      default:
        throw new Error(`Unsupported inventory type: ${exportDTO.inventoryType} for BOM format`);
    }
  }
}
