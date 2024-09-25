import { ExportSource } from '../../../../api/types';
import { Format } from '../Format';
import { ExportModel } from '../Model/ExportModel';

export interface ScanossJsonComponent {
  path?: string,
  purl: string,
}

export interface ScanossJsonOutput {
  bom: {
    include: Array<ScanossJsonComponent>;
    remove: Array<ScanossJsonComponent>;
  }
}

export class ScanossJson extends Format {
  private source: string;

  private model: ExportModel;

  private scanossJson: ScanossJsonOutput;

  constructor(source: string, model: ExportModel = new ExportModel()) {
    super();
    this.source = source;
    this.extension = '.json';
    this.model = model;
    this.scanossJson = { bom: { include: [], remove: [] } };
  }

  private async generateScanossJson() {
    const includedComponents: Array<ScanossJsonComponent> = [];
    const ignoredComponents: Array<ScanossJsonComponent> = [];
    const partiallyIgnoredComponents = [];
    const components = await this.model.getScanossComponentJsonData();
    components.forEach((c) => {
      if (c.identifiedFiles > 0) includedComponents.push({ purl: c.purl });
      if (c.totalMatchedFiles === c.ignoredFiles && c.source === 'engine') ignoredComponents.push({ purl: c.purl });
      if ((c.ignoredFiles > 0 && c.ignoredFiles < c.totalMatchedFiles)) partiallyIgnoredComponents.push(c.purl);
    });
    const ignoredComponentFiles = await this.model.getScanossIgnoredComponentFiles(partiallyIgnoredComponents);

    this.scanossJson.bom.include = includedComponents;
    this.scanossJson.bom.remove = [...ignoredComponents, ...ignoredComponentFiles];
    return JSON.stringify(this.scanossJson, null, 2);
  }

  public async generate() {
    if (this.source === ExportSource.IDENTIFIED) {
      return this.generateScanossJson();
    }
    return JSON.stringify(this.scanossJson, null, 2);
  }
}
