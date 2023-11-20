import { DataProvider, IDataLayers, SummaryDataLayer } from 'scanoss';
import { modelProvider } from '../../../services/ModelProvider';
import { workspace } from '../../../workspace/Workspace';

export class IdentifiedSummaryDataProvider implements DataProvider {
  private summary: SummaryDataLayer;

  private reportTitle: string;

  constructor(reportTitle: string) {
    this.reportTitle = reportTitle;
  }
  public getLayerName(): string {
    return this.constructor.name;
  }
  public async getData(): Promise<IDataLayers> {
    const summary = await modelProvider.model.file.getSummary();
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
