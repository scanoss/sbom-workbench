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
import { cryptographyService } from '../../../services/CryptographyService';

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
      const cryptoCfg = new CryptoCfg();
      cryptoCfg.ALGORITHM_RULES_PATH = await cryptographyService.getAlgorithmRulesPath();
      cryptoCfg.LIBRARY_RULES_PATH = await cryptographyService.getLibraryRulesPath();
      cryptoCfg.THREADS = this.THREADS;
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
