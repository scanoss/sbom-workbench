import { ExportSource, ExportStatusCode } from '../../../../../api/types';
import { ExportResult, Format } from '../../Format';
import { ExportRepositorySqliteImp } from '../../Repository/ExportRepositorySqliteImp';
import { ExportRepository } from '../../Repository/ExportRepository';
import { DecisionTree } from './identification-tree/decision-tree';

/**
 * Represents a component in the SCANOSS JSON output.
 */
export interface Component {
  path?: string;
  purl: string;
}

export interface ComponentReplace {
  paths: Array<string>;
  purl: string;
  replace_with: string;
}

/**
 * Represents the structure of the SCANOSS JSON output.
 */
export interface SettingsOutput {
  bom: {
    include: Array<Component>;
    remove: Array<Component>;
    replace: Array<ComponentReplace>;
  }
}

/**
 * Class for generating SCANOSS JSON output.
 * @extends Format
 */
export class Settings extends Format {
  private source: string;

  private model: ExportRepository;

  private scanossJson: SettingsOutput;

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
    this.scanossJson = { bom: { include: [], remove: [], replace: [] } };
  }

  /**
   * Generates the SCANOSS JSON output.
   * This method retrieves all identified components, ignored components, ignored files and replaced components
   * to create a SCANOSS JSON output.
   * @private
   * @returns {Promise<string>} A promise that resolves to the stringified SCANOSS JSON output
   */
  private async generateSettingsFile(): Promise<string> {
    const identificationData = await this.model.getDecisionData();
    const decisionTree = new DecisionTree();
    decisionTree.build(identificationData);
    const bom = decisionTree.getBom();
    return JSON.stringify({ bom }, null, 2);
  }

  /**
   * Generates the output based on the specified source.
   * If the source is 'IDENTIFIED', it generates the SCANOSS JSON output.
   * Otherwise, it returns the default empty SCANOSS JSON structure.
   * @public
   * @returns {Promise<ExportResult>}
   */
  public async generate(): Promise<ExportResult> {
    if (this.source === ExportSource.IDENTIFIED) {
      return {
        report: await this.generateSettingsFile(),
        status: {
          code: ExportStatusCode.SUCCESS,
          info: {
            invalidPurls: [],
          },
        },
      };
    }
    return {
      report: JSON.stringify(this.scanossJson, null, 2),
      status: {
        code: ExportStatusCode.SUCCESS,
        info: {
          invalidPurls: [],
        },
      },
    };
  }
}
