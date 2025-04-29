import log from 'electron-log';
import i18next from 'i18next';
import { CryptographyScanner, CryptoCfg, LocalCryptographyResponse } from 'scanoss';
import path from 'path';
import { modelProvider } from '../../../services/ModelProvider';
import { Project } from '../../../workspace/Project';
import { Scanner } from '../types';
import { ScannerStage } from '../../../../api/types';
import { normalizeCryptoAlgorithms } from '../../../../shared/adapters/crypto.adapter';
import { NodeStatus } from '../../../workspace/tree/Node';
import { fileExists } from '../../../utils/utils';

/**
 * Represents a pipeline task for performing local cryptography analysis.
 */
export class LocalCryptographyTask implements Scanner.IPipelineTask {
  private project: Project;

  private readonly THREADS = 5;

  private readonly DEFAULT_SCANOSS_CRYPTO_ALGORITHM_RULES_FILENAME = 'scanoss-crypto-algorithm-rules.json';

  private readonly DEFAULT_SCANOSS_CRYPTO_LIBRARY_RULES_FILENAME = 'scanoss-crypto-library-rules.json';

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
   * Gets the base asset path based on the current environment (development or production).
   *
   * @returns The appropriate base path for accessing assets based on the current environment
   */
  private getAssetPath(): string {
    const isDev = process.env.NODE_ENV !== 'production';
    return isDev
      ? path.join(__dirname, '../../../../../assets/data')
      : path.join(__dirname, '../../../assets/data');
  }

  /**
   * Retrieves the file path to the cryptography algorithm rules.
   *
   * The method searches for algorithm rules in the following order:
   * 1. Custom rules defined at the project's scan root
   * 2. Default rules packaged with the application (location depends on environment)
   *
   * @returns Promise resolving to the absolute path of the algorithm rules file
   */
  private async getAlgorithmRulesPath(): Promise<string> {
    const customAlgorithmRulesFilePath = path.join(this.project.getScanRoot(), this.DEFAULT_SCANOSS_CRYPTO_ALGORITHM_RULES_FILENAME);
    if (await fileExists(customAlgorithmRulesFilePath)) {
      log.info('[ Local Cryptography Task ] - Custom cryptography algorithm rules found');
      return customAlgorithmRulesFilePath;
    }
    return path.join(this.getAssetPath(), this.DEFAULT_SCANOSS_CRYPTO_ALGORITHM_RULES_FILENAME);
  }

  /**
   * Retrieves the file path to the cryptography library rules.
   *
   * The method searches for cryptography library rules in the following order:
   * 1. Custom rules defined at the project's scan root
   * 2. Default rules packaged with the application (location depends on environment)
   *
   * @returns Promise resolving to the absolute path of the cryptography library rules file
   */
  private async getLibraryRulesPath():Promise<string> {
    const customLibraryRulesFilePath = path.join(this.project.getScanRoot(), this.DEFAULT_SCANOSS_CRYPTO_LIBRARY_RULES_FILENAME);
    if (await fileExists(customLibraryRulesFilePath)) {
      log.info('[ Local Cryptography Task ] - Custom cryptography library rules found');
      return customLibraryRulesFilePath;
    }
    return path.join(this.getAssetPath(), this.DEFAULT_SCANOSS_CRYPTO_LIBRARY_RULES_FILENAME);
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
      const cryptoCfg = new CryptoCfg({
        algorithmRulesPath: await this.getAlgorithmRulesPath(),
        libraryRulesPath: await this.getLibraryRulesPath(),
        threads: this.THREADS,
      });
      const cryptoScanner = new CryptographyScanner(cryptoCfg);
      const files = this.project.getTree().getRootFolder().getFiles();

      // Filter dependency files, binary files and filtered files
      const filePaths: string[] = files
        .filter((f) => !f.isBinaryFile && !f.isDependencyFile && f.type !== NodeStatus.FILTERED)
        .map((f) => path.join(this.project.getScanRoot(), f.path));

      // Create map to get fileId from absolute file path
      const dbFiles = await modelProvider.model.file.getAll(null);
      const dbFileMapper = new Map<string, number>();
      dbFiles.forEach((f) => { dbFileMapper.set(path.join(this.project.getScanRoot(), f.path), f.id); });

      // Scan local cryptography
      const localCryptography = await cryptoScanner.scanFiles(filePaths);
      // Import local cryptography
      await this.importLocalCrypto(localCryptography, dbFileMapper);
      return true;
    } catch (e) {
      log.error('[ Local Crypto Task ]: ', e);
      return false;
    }
  }

  /**
   * Imports the results of local cryptography analysis into the database.
   * @param crypto The results of local cryptography analysis.
   * @param dbFileMapper Map used to get db file ids from filepath results
   */
  private async importLocalCrypto(crypto: LocalCryptographyResponse, dbFileMapper: Map<string, number>) {
    const filesWithCrypto = crypto.fileList.filter((ci) => ci.algorithms.length > 0 || ci.hints.length > 0);

    const localCrypto = filesWithCrypto.map((fc) => ({
      fileId: dbFileMapper.get(fc.file),
      algorithms: JSON.stringify(normalizeCryptoAlgorithms(fc.algorithms)),
      hints: fc.hints }
    ));

    // Import results of local cryptography
    await modelProvider.model.localCryptography.import(localCrypto);
  }
}
