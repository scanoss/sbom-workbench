import { Format } from '../Format';
import { ExportSource } from '../../../../api/types';
import { modelProvider } from '../../../services/ModelProvider';
import { Algorithms, Cryptography } from '../../../model/entity/Cryptography';
import { LocalCryptography } from '../../../model/entity/LocalCryptography';

export interface CryptoComponent {
  component: string,
  algorithms: string,
}

export interface CryptoLocal {
  file: string,
  algorithms: string,
}

export interface CBOMInputData {
  components: Array<CryptoComponent>;
  local: Array<CryptoLocal>
}

export class Cbom extends Format {
  private source: string;

  constructor(source: string) {
    super();
    this.source = source;
    this.extension = '.csv';
  }

  private csvCreate(data: CBOMInputData) {
    let csv = 'Source, Algorithms\n';

    // Local
    data.local.forEach((c) => {
      const row = `${c.file}, ${c.algorithms}\r\n`;
      csv += row;
    });

    // Components
    data.components.forEach((c) => {
      const row = `${c.component}, ${c.algorithms}\r\n`;
      csv += row;
    });

    return csv;
  }

  // @override
  public async generate() {
    const data = this.source === ExportSource.IDENTIFIED
      ? await this.getIdentifyData()
      : await this.getDetectedData();
    const csv = this.csvCreate(data);
    return csv;
  }

  /**
   * Generates a string of unique algorithms from an array of algorithm objects.
   * @param {Array<Algorithms>} algorithms - The array of algorithm objects.
   * @returns {string} The string of unique algorithms separated by ' - '.
   */
  private getUniqueAlgorithms(algorithms: Array<Algorithms>): string {
    const uniqueAlgorithms = new Set<string>();
    algorithms.forEach((alg) => {
      uniqueAlgorithms.add(alg.algorithm);
    });

    const uniqueAlgorithmsString = Array.from(uniqueAlgorithms).join(' - ');
    return uniqueAlgorithmsString;
  }

  /**
   * Converts an array of local cryptography data to an array of CryptoLocal objects.
   * @param {Array<LocalCryptography>} crypto - The array of local cryptography data.
   * @returns {Array<CryptoLocal>} The array of CryptoLocal objects.
   */
  private getLocalCrypto(crypto: Array<LocalCryptography>): Array<CryptoLocal> {
    const localCrypto = [];
    crypto.forEach((c) => {
      const fileCrypto = {
        file: c.file,
        algorithms: this.getUniqueAlgorithms(c.algorithms),
      };
      localCrypto.push(fileCrypto);
    });

    return localCrypto;
  }

  /**
   * Converts an array of cryptography data to an array of CryptoComponent objects.
   * @param {Array<Cryptography>} crypto - The array of cryptography data.
   * @returns {Array<CryptoComponent>} The array of CryptoComponent objects.
   */
  private getComponentCrypto(crypto: Array<Cryptography>): Array<CryptoComponent> {
    const cryptoComponents = [];
    crypto.forEach((c) => {
      const cryptoComponent = {
        component: `${c.purl}@${c.version}`,
        algorithms: this.getUniqueAlgorithms(c.algorithms),
      };
      cryptoComponents.push(cryptoComponent);
    });

    return cryptoComponents;
  }

  /**
   * Fetches cryptography data identified as matched from the database.
   * @returns {Promise<CBOMInputData>} The cryptography data.
   */
  private async getDetectedData(): Promise<CBOMInputData> {
    const components = await modelProvider.model.cryptography.findAllDetected();
    const cryptoComponents = this.getComponentCrypto(components);

    const local = await modelProvider.model.localCryptography.findAll();
    const localCrypto = this.getLocalCrypto(local);

    return {
      components: cryptoComponents,
      local: localCrypto,
    };
  }

  /**
   * Fetches cryptography data identified as matched from the database.
   * @returns {Promise<CBOMInputData>} The cryptography data.
   */
  private async getIdentifyData(): Promise<CBOMInputData> {
    const components = await modelProvider.model.cryptography.findAllIdentifiedMatched();
    const cryptoComponents = this.getComponentCrypto(components);

    const local = await modelProvider.model.localCryptography.findAll();
    const localCrypto = this.getLocalCrypto(local);

    return {
      components: cryptoComponents,
      local: localCrypto,
    };
  }
}
