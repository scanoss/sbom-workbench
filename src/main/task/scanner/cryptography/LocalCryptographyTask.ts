import log from 'electron-log';
import i18next from 'i18next';
import { CryptographyScanner, CryptoCfg, ILocalCryptographyResponse } from 'scanoss';
import path from 'path';
import { modelProvider } from '../../../services/ModelProvider';
import { Project } from '../../../workspace/Project';
import { Scanner } from '../types';
import { ScannerStage } from '../../../../api/types';

/**
 * Represents a pipeline task for performing local cryptography analysis.
 */
export class LocalCryptographyTask implements Scanner.IPipelineTask {
  private project: Project;

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
      }
      const cryptoCfg = new CryptoCfg(rules);
      const cryptoScanner = new CryptographyScanner(cryptoCfg);
      const allFiles = this.project.getTree().getRootFolder().getFiles();

      // Get files that have not been filtered
      const files = allFiles
        .filter((f) => f.type !== 'FILTERED')
        .map((f) => path.join(this.project.getScanRoot(), f.path));

      const localCryptography = await cryptoScanner.scan(files);

      // Import local cryptography
      await this.importLocalCrypto(localCryptography);

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
  private async importLocalCrypto(crypto: ILocalCryptographyResponse) {
    // Creates a map to get file id by file path
    const files = await modelProvider.model.file.getAll(null);
    const fileIdMapper = new Map<string, number>();
    files.forEach((f) => { fileIdMapper.set(f.path, f.id); });

    // Remove scan root from each ICryptoItem
    const scanRoot = this.project.getScanRoot();
    const filesWithCrypto = crypto.fileList.filter((ci) => ci.algorithms.length > 0);
    console.log(scanRoot);
    filesWithCrypto.forEach((ci) => { 
      ci.file = '/' + path.relative(scanRoot, ci.file);;
    });
    // Convert file paths to fileIds
    const localCrypto = filesWithCrypto.map((fc) => { return { fileId: fileIdMapper.get(fc.file), algorithms: JSON.stringify(fc.algorithms) }; });

    // Import results of local cryprography
    await modelProvider.model.localCryptography.import(localCrypto);
  }
}
