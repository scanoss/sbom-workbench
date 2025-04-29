import log from 'electron-log';
import { CryptographyService, PurlRequest } from 'scanoss';
import { ExportControlGetAllDTO, SourceType } from '../../api/dto';
import { AppConfigDefault } from '../../config/AppConfigDefault';
import { ExportControl } from '../model/entity/ExportControl';
import { modelProvider } from './ModelProvider';
import { ExportControlResponseDTO } from '../../api/types';

class ExportControlService {

  /*
  private async getDetected():Promise<ExportControlResponseDTO> {
    // Components
    const componentExportControl = await modelProvider.model.exportControl.findAll();
    const componentsSummary = await modelProvider.model.exportControl.getDetectedSummary();
    // Files
    // TODO: Call exportControlLocal for files
    return {
      files: null,
      components: {
        data: componentExportControl,
        categorySummary: componentsSummary.categorySummary,
        total: componentsSummary.total,
      },
    };
  }

  private async getIdentified():Promise<ExportControlResponseDTO> {
    // Components
    const componentExportControl = await modelProvider.model.exportControl.findAllIdentified();
    const componentsSummary = await modelProvider.model.exportControl.getIdentifiedSummary();
    // Files
    // TODO: Call exportControlLocal for files
    return {
      files: null,
      components: {
        data: componentExportControl,
        categorySummary: componentsSummary.categorySummary,
        total: componentsSummary.total,
      },
    };
  } */

/*  public async getAll({ type } : ExportControlGetAllDTO): Promise<ExportControlResponseDTO> {
    if (type === SourceType.detected) return this.getDetected();
    return this.getIdentified();
  } */
}

export const exportControlService = new ExportControlService();
