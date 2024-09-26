import { ExportSource } from '../../../../api/types';
import { Format } from '../Format';
import { ExportRepositorySqliteImp } from '../Repository/ExportRepositorySqliteImp';
import { ExportRepository } from '../Repository/ExportRepository';

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

  private model: ExportRepository;

  private scanossJson: ScanossJsonOutput;

  /**
   * Creates an instance of ScanossJson.
   * @param {string} source - The source of the export data (IDENTIFIED - DETECTED)
   * @param {ExportRepositorySqliteImp} [model=new ExportRepositorySqliteImp()] - The model used for data retrieval
   */
  constructor(source: string, model: ExportRepository = new ExportRepositorySqliteImp()) {
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
  private async generateScanossJson(): Promise<string> {
    const components = await this.model.getScanossComponentJsonData();
    const [includedComponents, ignoredComponents, partiallyIgnoredComponents] = components.reduce(
      ([included, ignored, partialIgnored], c) => {
        if (c.identifiedFiles > 0) included.push({ purl: c.purl });
        if (c.totalMatchedFiles === c.ignoredFiles && c.source === 'engine') ignored.push({ purl: c.purl });
        if (c.ignoredFiles > 0 && c.ignoredFiles < c.totalMatchedFiles) partialIgnored.push(c.purl);
        return [included, ignored, partialIgnored];
      },
      [[], [], []] as [ScanossJsonComponent[], ScanossJsonComponent[], string[]],
    );

    // Retrieve ignored component file from a list of purls
    const ignoredComponentFiles = await this.model.getScanossIgnoredComponentFiles(partiallyIgnoredComponents);
    this.scanossJson.bom = {
      include: includedComponents,
      remove: [...ignoredComponents, ...ignoredComponentFiles],
    };
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
