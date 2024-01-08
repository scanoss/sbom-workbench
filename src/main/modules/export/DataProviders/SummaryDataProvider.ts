import { DataProvider, IDataLayers, SummaryDataLayer } from 'scanoss';
import { modelProvider } from '../../../services/ModelProvider';
import { workspace } from '../../../workspace/Workspace';
import { BaseDataProvider } from './BaseDataProvider';
import { ExportSource } from '../../../../api/types';

export class SummaryDataProvider extends BaseDataProvider implements DataProvider {
  private summary: SummaryDataLayer;

  private reportTitle: string;

  constructor(reportTitle: string, source: ExportSource) {
    super(source);
    this.reportTitle = reportTitle;
  }

  public getLayerName(): string {
    return this.constructor.name;
  }

  public async getData(): Promise<IDataLayers> {
    const summary = this.source === ExportSource.IDENTIFIED ? await modelProvider.model.file.getSummary() : await modelProvider.model.file.getDetectedSummary();
    const p = workspace.getOpenedProjects()[0];

    this.summary = {
      reportTitle: this.reportTitle,
      timestamp: new Date(p.metadata.getDate()),
      projectName: p.metadata.getName(),
      matchedFiles: summary.matchFiles,
      totalFiles: summary.totalFiles,
      noMatchFiles: summary.noMatchFiles,
    };

    return <IDataLayers>{ summary: this.summary };
  }
}
