import { ExportSource } from '../../../../api/types';
import { Format } from '../Format';
import { ExportModel } from '../Model/ExportModel';

/**
 * Represents a component in the SCANOSS JSON output.
 */
export interface ScanossJsonComponent {
  path?: string,
  purl: string,
}

/**
 * Represents the structure of the SCANOSS JSON output.
 */
export interface ScanossJsonOutput {
  bom: {
    include: Array<ScanossJsonComponent>;
    remove: Array<ScanossJsonComponent>;
  }
}

/**
 * Class for generating SCANOSS JSON output.
 * @extends Format
 */
export class ScanossJson extends Format {
  private source: string;

  private model: ExportModel;

  private scanossJson: ScanossJsonOutput;

  /**
   * Creates an instance of ScanossJson.
   * @param {string} source - The source of the export data (IDENTIFIED - DETECTED)
   * @param {ExportModel} [model=new ExportModel()] - The model used for data retrieval
   */
  constructor(source: string, model: ExportModel = new ExportModel()) {
    super();
    this.source = source;
    this.extension = '.json';
    this.model = model;
    this.scanossJson = { bom: { include: [], remove: [] } };
  }

  /**
   * Generates the SCANOSS JSON output.
   * This method retrieves all identified components, ignored components, and ignored files
   * to create a SCANOSS JSON output.
   * @private
   * @returns {Promise<string>} A promise that resolves to the stringified SCANOSS JSON output
   */
  private async generateScanossJson() {
    const includedComponents: Array<ScanossJsonComponent> = [];
    const ignoredComponents: Array<ScanossJsonComponent> = [];
    const partiallyIgnoredComponents = [];
    const components = await this.model.getScanossComponentJsonData();

    // Retrieve component data and categorize components
    components.forEach((c) => {
      if (c.identifiedFiles > 0) includedComponents.push({ purl: c.purl });
      if (c.totalMatchedFiles === c.ignoredFiles && c.source === 'engine') ignoredComponents.push({ purl: c.purl });
      if ((c.ignoredFiles > 0 && c.ignoredFiles < c.totalMatchedFiles)) partiallyIgnoredComponents.push(c.purl);
    });

    // Retrieve ignored component file from a list of purls
    const ignoredComponentFiles = await this.model.getScanossIgnoredComponentFiles(partiallyIgnoredComponents);

    this.scanossJson.bom.include = includedComponents;
    this.scanossJson.bom.remove = [...ignoredComponents, ...ignoredComponentFiles];
    return JSON.stringify(this.scanossJson, null, 2);
  }

  /**
   * Generates the output based on the specified source.
   * If the source is 'IDENTIFIED', it generates the SCANOSS JSON output.
   * Otherwise, it returns the default empty SCANOSS JSON structure.
   * @public
   * @returns {Promise<string>} A promise that resolves to the stringified JSON output
   */
  public async generate() {
    if (this.source === ExportSource.IDENTIFIED) {
      return this.generateScanossJson();
    }
    return JSON.stringify(this.scanossJson, null, 2);
  }
}
