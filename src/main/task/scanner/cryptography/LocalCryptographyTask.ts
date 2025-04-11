import log from 'electron-log';
import i18next from 'i18next';
import { CryptographyAlgorithmScanner , CryptoCfg, ILocalCryptographyResponse } from 'scanoss';
import path from 'path';
import { modelProvider } from '../../../services/ModelProvider';
import { Project } from '../../../workspace/Project';
import { Scanner } from '../types';
import { ScannerStage } from '../../../../api/types';
import { normalizeCryptoAlgorithms } from '../../../../shared/adapters/crypto.adapter';
import { NodeStatus } from '../../../workspace/tree/Node';

/**
 * Represents a pipeline task for performing local cryptography analysis.
 */
export class LocalCryptographyTask implements Scanner.IPipelineTask {
  private project: Project;

  private readonly THREADS = 5;

  /**
   * Constructs a new LocalCryptographyTask with the specified project.
   * @param project The project to analyze for local cryptography.
   */
  constructor(project: Project) {
    this.project = project;
  }

  /**
   * Retrieves the properties of the stage associated with this task.
   * @returns The stage properties.
   */
  public getStageProperties():Scanner.StageProperties {
    return {
      name: ScannerStage.LOCAL_CRYPTOGRAPHY,
      label: i18next.t('Title:AnalyzingCryptography'),
      isCritical: false,
    };
  }

  /**
   * Runs the local cryptography analysis task.
   * @returns A promise that resolves to a boolean indicating the success of the task.
   */
  public async run():Promise<boolean> {
    try {
      log.info('[ LocalCryptographyTask init ]');

      // Delete all local crypto
      await modelProvider.model.localCryptography.deleteAll();
      let rules = null;
      const rootFolder = this.project.getTree().getRootFolder();
      if (rootFolder.containsFile('scanoss-crypto-rules.json')) {
        rules = path.join(this.project.getScanRoot(), 'scanoss-crypto-rules.json');
      } else {
        const isDev = process.env.NODE_ENV !== 'production';
        rules = isDev
          ? path.join(__dirname, '../../../../../assets/data/defaultCryptoRules.json')
          : path.join(__dirname, '../../../assets/data/defaultCryptoRules.json');
      }
      const cryptoCfg = new CryptoCfg({ rulesPath: rules, threads: this.THREADS });
      const cryptoScanner = new CryptographyAlgorithmScanner(cryptoCfg);
      const files = this.project.getTree().getRootFolder().getFiles();

      // Map absolute -> relative
      const fileIdMapper = new Map<string, string>();

      files
        .filter((f) => !f.isBinaryFile && !f.isDependencyFile && f.type !== NodeStatus.FILTERED)
        .forEach((f) => fileIdMapper.set(path.join(this.project.getScanRoot(), f.path), f.path));

      const localCryptography = await cryptoScanner.scan([...fileIdMapper.keys()]);
      // Import local cryptography
      await this.importLocalCrypto(localCryptography, fileIdMapper);

      return true;
    } catch (e) {
      log.error('[ LOCAL CRYPTO TASK ]: ', e);
      return false;
    }
  }

  /**
   * Imports the results of local cryptography analysis into the database.
   * @param crypto The results of local cryptography analysis.
   */
  private async importLocalCrypto(crypto: ILocalCryptographyResponse, filePathMapper: Map<string, string>) {
    // Map relative -> fileId
    const files = await modelProvider.model.file.getAll(null);
    const fileIdMapper = new Map<string, number>();
    files.forEach((f) => { fileIdMapper.set(f.path, f.id); });

    // Remove scan root from each ICryptoItem
    const filesWithCrypto = crypto.fileList.filter((ci) => ci.algorithms.length > 0);

    // Convert file paths to fileIds
    const localCrypto = filesWithCrypto.map((fc) => ({ fileId: fileIdMapper.get(filePathMapper.get(fc.file)), algorithms: JSON.stringify(normalizeCryptoAlgorithms(fc.algorithms)), hints: [] }));

    // Import results of local cryprography
    await modelProvider.model.localCryptography.import(localCrypto);
  }
}
