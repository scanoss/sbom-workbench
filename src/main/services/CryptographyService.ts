import { CryptographyResponseDTO, NewComponentDTO } from '@api/types';
import log from 'electron-log';
import { workspace } from '../workspace/Workspace';
import { AddCryptographyTask } from '../task/cryptography/AddCryptographyTask';
import { modelProvider } from './ModelProvider';
import { componentHelper } from '../helpers/ComponentHelper';
import { SourceType } from '../../api/dto';
import { LocalCryptographyTask } from '../task/scanner/cryptography/LocalCryptographyTask';
import path from 'path';
import { fileExists } from '../utils/utils';
import fs from 'fs';
import { CryptographicItem } from '../model/entity/Cryptography';

class CryptographyService {
  private readonly DEFAULT_SCANOSS_CRYPTO_ALGORITHM_RULES_FILENAME = 'scanoss-crypto-algorithm-rules.json';

  private readonly DEFAULT_SCANOSS_CRYPTO_LIBRARY_RULES_FILENAME = 'scanoss-crypto-library-rules.json';

  public async importFromComponents(components: Array<NewComponentDTO>) {
    try {
      const p = workspace.getOpenProject();
      if (p.getApiKey()) {
        log.info('%c[ Crypto ]: Importing cryptography into database', 'color: green');
        const cryptoTask = new AddCryptographyTask();
        const comp = this.adaptToCryptographyTask(components);
        await cryptoTask.run({ components: comp, token: p.getApiKey() });
      }
    }catch (e){
      log.error("[Cryptography Service]: ", e);
    }
  }

  private adaptToCryptographyTask(components: NewComponentDTO[]): Array<string> {
    const response = components.flatMap((component: NewComponentDTO) =>
      component.versions.map((v) => `${component.purl}@${v.version}`)
    );

    return response;
  }

  public async update():Promise<void> {
    try {
      const p = workspace.getOpenProject();

      if (!p.getApiKey()) return;

      // Component Crypto
      const componentVersion = await modelProvider.model.component.getAll(null);
      const dependencyComponents = await modelProvider.model.dependency.getAll(null);
      const components = componentHelper.groupComponentByPurlVersion(componentVersion, dependencyComponents);
      const cryptographyTask = new AddCryptographyTask();
      await cryptographyTask.run({ components, token: p.getApiKey(), force: true });

      // Local Crypto
      const localCrypto = new LocalCryptographyTask(p);
      await localCrypto.run();

    } catch (e: any) {
      throw new Error(`Error updating cryptography: cause: ${e.message}`);
    }
  }

  public async getAll(type: SourceType): Promise<CryptographyResponseDTO> {
    return type === SourceType.detected ? this.getDetected() : this.getIdentified();
  }

  public async getKeywordsByKeys(keys: Array<string>): Promise<Array<string>>{
    const keySet = new Set(keys.map(key =>key.toLowerCase()));
    const algorithmRulesPath = await this.getAlgorithmRulesPath();


    // Algorithm
    const algorithmData = await fs.promises.readFile(algorithmRulesPath,'utf8');
    const algorithmRules = JSON.parse(algorithmData);
    const algorithms = algorithmRules.filter((rule: any) => keySet.has(rule.algorithmId.toLowerCase()));

    // Library
    const libraryRulesPath = await this.getLibraryRulesPath();
    const libraryRulesData = await fs.promises.readFile(libraryRulesPath,'utf8');
    const libraryRules = JSON.parse(libraryRulesData);
    const libraries = libraryRules.filter((rule: any) => keySet.has(rule.id.toLowerCase()));
    const keywords: Array<string> = [];
    algorithms.forEach((algorithm, index) => {
      keywords.push(...(algorithm ? algorithm.keywords : []));
    });
    libraries.forEach((library, index) => {
      keywords.push(...(library ? library.keywords : []));
    });
    return keywords;
  }

  public async getFilesByCrypto(crypto: Array<string>): Promise<{ files: Array<string>, crypto: Array<string> }>{
    const cryptoSet = new Set(crypto);
    const files = await modelProvider.model.localCryptography.findAllDetectedGroupByType();
    const result = {
      files: [],
      crypto: []
    };

    const matchedCrypto = new Set<string>();

    result.files = files.filter((file: CryptographicItem) => {
      // Check if file has any matching crypto values
      const hasMatch = file.values.some((v) => cryptoSet.has(v));

      if (hasMatch) {
        // Collect matched crypto algorithms
        file.values.forEach((v) => {
          if (cryptoSet.has(v)) {
            matchedCrypto.add(v);
          }
        });
      }
      return hasMatch;
    }).map((f)=> f.name);

    result.files = Array.from(new Set(result.files).values());

    result.crypto = Array.from(matchedCrypto);

    return result;
  }

  public async getDetectedKeys(): Promise<Array<string>> {
    const files = await modelProvider.model.localCryptography.findAllDetectedGroupByType();
    const detectedKeys = new Set<string>();
    files.forEach((file: CryptographicItem) => {
      file.values.forEach((v) => {
        detectedKeys.add(v);
      });
    });
    return Array.from(detectedKeys);
  }

  private async getDetected(): Promise<CryptographyResponseDTO> {
    try {
      // Get identified algorithms and hints
      const components = await modelProvider.model.cryptography.findAllDetectedGroupByType();
      const files = await modelProvider.model.localCryptography.findAllDetectedGroupByType();

      // Crypto type summary for identified files(local) and components: i.e { algorithm: 2, library:1 }
      const localTypeSummary = await modelProvider.model.localCryptography.getDetectedTypeSummary();
      const componentTypeSummary = await modelProvider.model.cryptography.getDetectedTypeSummary();

      // Crypto summary for identified files(local) and components: i.e { md5: 2, openssl:1 }
      const localCryptoSummary = await modelProvider.model.localCryptography.getDetectedCryptoSummary();
      const componentCryptoSummary = await modelProvider.model.cryptography.getDetectedCryptoSummary();

      // Get detection grouped by type { algorithm: ['MD5'] }
      const localTypeDetection = await modelProvider.model.localCryptography.getDetectedDetectionGroupedByType();
      const componentTypeDetection = await modelProvider.model.cryptography.getDetectedDetectionGroupedByType();

      return {
        files,
        components,
        summary: {
          files: {
            type: localTypeSummary,
            crypto: localCryptoSummary, // TODO: Rename to detection
            typeDetection: localTypeDetection,
          },
          components: {
            type: componentTypeSummary,
            crypto: componentCryptoSummary, // TODO: Rename to detection
            typeDetection: componentTypeDetection,
          },
        },
      };
    } catch (e: any) {
      throw new Error(`Error retrieving detected cryptography: cause: ${e.message}`);
    }
  }

  private async getIdentified(): Promise<CryptographyResponseDTO> {
    try {
      // Get identified algorithms and hints
      const components = await modelProvider.model.cryptography.findAllIdentifiedGroupByType();
      const files = await modelProvider.model.localCryptography.findAllIdentifiedGroupByType();

      // Crypto type summary for identified files(local) and components: i.e { algorithm: 2, library:1 }
      const fileTypeSummary = await modelProvider.model.localCryptography.getIdentifiedTypeSummary();
      const componentTypeSummary = await modelProvider.model.cryptography.getIdentifiedTypeSummary();

      // Crypto summary for identified files(local) and components: i.e { md5: 2, openssl:1 }
      const fileCryptoSummary = await modelProvider.model.localCryptography.getIdentifiedCryptoSummary();
      const componentCryptoSummary = await modelProvider.model.cryptography.getIdentifiedCryptoSummary();

      // Get detection grouped by type { algorithm: ['MD5'] }
      const localTypeDetection = await modelProvider.model.localCryptography.getIdentifiedDetectionGroupedByType();
      const componentTypeDetection = await modelProvider.model.cryptography.getIdentifiedDetectionGroupedByType();

      return {
        files,
        components,
        summary: {
          files: {
            type: fileTypeSummary,
            crypto: fileCryptoSummary,
            typeDetection: localTypeDetection,
          },
          components: {
            type: componentTypeSummary,
            crypto: componentCryptoSummary,
            typeDetection: componentTypeDetection,
          },
        },
      };
    } catch (e: any) {
      throw new Error(`Error retrieving identified cryptography: cause: ${e.message}`);
    }
  }

  /**
   * Gets the base asset path based on the current environment (development or production).
   *
   * @returns The appropriate base path for accessing assets based on the current environment
   */
  private getAssetPath(): string {
    const isDev = process.env.NODE_ENV !== 'production';
    return isDev
      ? path.join(__dirname, '../../../assets/data')
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
  public async getAlgorithmRulesPath(): Promise<string> {
    const project = workspace.getOpenProject();
    const customAlgorithmRulesFilePath = path.join(project.getScanRoot(), this.DEFAULT_SCANOSS_CRYPTO_ALGORITHM_RULES_FILENAME);
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
  public async getLibraryRulesPath():Promise<string> {
    const project = workspace.getOpenProject();
    const customLibraryRulesFilePath = path.join(project.getScanRoot(), this.DEFAULT_SCANOSS_CRYPTO_LIBRARY_RULES_FILENAME);
    if (await fileExists(customLibraryRulesFilePath)) {
      log.info('[ Local Cryptography Task ] - Custom cryptography library rules found');
      return customLibraryRulesFilePath;
    }
    return path.join(this.getAssetPath(), this.DEFAULT_SCANOSS_CRYPTO_LIBRARY_RULES_FILENAME);
  }
}

export const cryptographyService = new CryptographyService();
