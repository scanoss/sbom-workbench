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
import AppConfig from '../../config/AppConfigModule';

/**
 * Interface for algorithm rule structure from JSON
 */
interface AlgorithmRule {
  algorithmId: string;
  algorithm: string;
  strength: string;
  category: string;
  keywords: string[];
}

/**
 * Interface for library rule structure from JSON
 */
interface LibraryRule {
  id: string;
  keywords: string[];
  name: string;
  description;
}

class CryptographyService {
  private lastAlgorithmPath = null;
  private lastLibraryPath = null;
  private cryptoKeywordsMap: Map<string,Array<string>> = null;
  private algorithmRules: Array<AlgorithmRule> = null;
  private libraryRules: Array<LibraryRule> = null;

  // Add cleanup timer
  private cleanupTimer: NodeJS.Timeout | null = null;
  private readonly CACHE_CLEANUP_TIME = 5 * 60 * 1000; // 5 minutes in ms

  // Add method to clear cached data
  private clearCache(): void {
    log.info('[ Cryptography Service ] - Clearing cached rules from memory');
    this.cryptoKeywordsMap = null;
    this.algorithmRules = null;
    this.lastAlgorithmPath = null;
    this.lastLibraryPath = null;
    this.libraryRules = null;
    this.cleanupTimer = null;
  }

  private resetCleanupTimer(): void {
    // Clear existing timer if any
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
    }

    // Set new timer to clear cache after 5 minutes
    this.cleanupTimer = setTimeout(() => {
      this.clearCache();
    }, this.CACHE_CLEANUP_TIME);
  }

  private adaptToCryptographyTask(components: NewComponentDTO[]): Array<string> {
    const response = components.flatMap((component: NewComponentDTO) =>
      component.versions.map((v) => `${component.purl}@${v.version}`)
    );

    return response;
  }

  private async getAlgorithmRules(): Promise<Array<AlgorithmRule>> {
    const algorithmRulesPath = await this.getAlgorithmRulesPath();
    // Load data if path changed OR if data is not cached
    if (algorithmRulesPath != this.lastAlgorithmPath || this.algorithmRules === null) {
      this.lastAlgorithmPath = algorithmRulesPath;
      const algorithmData = await fs.promises.readFile(algorithmRulesPath,'utf8');
      this.algorithmRules = JSON.parse(algorithmData);
    }
    this.resetCleanupTimer();
    return this.algorithmRules;
  }

  private async getLibraryRules(): Promise<Array<LibraryRule>> {
    const libraryRulesPath = await this.getLibraryRulesPath();
    // Load data if path changed OR if data is not cached
    if (libraryRulesPath != this.lastLibraryPath || this.libraryRules === null) {
      this.lastLibraryPath = libraryRulesPath;
      const libraryData = await fs.promises.readFile(libraryRulesPath,'utf8');
      this.libraryRules = JSON.parse(libraryData);
    }
    this.resetCleanupTimer();
    return this.libraryRules;
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
   * Helper method to add keywords from rules to the keyword map.
   *
   * For each rule, extracts its keywords and associates them with the rule's ID in the map.
   * Multiple rules can share the same keyword, resulting in an array of IDs per keyword.
   * All keywords are normalized to lowercase for case-insensitive matching.
   *
   * @param map - The map to populate with keyword-to-ID associations
   * @param rules - The array of rules to process
   * @param idExtractor - Function to extract the unique ID from each rule
   * @template T - Rule type that must contain a keywords array
   */
  private addKeywordsToMap<T extends { keywords: string[] }>(
    map: Map<string, Array<string>>,
    rules: Array<T>,
    idExtractor: (rule: T) => string
  ): void {
    rules.forEach((rule) => {
      const cryptoKey = idExtractor(rule);
      rule.keywords.forEach((keyword) => {
        const existingIds = map.get(keyword);

        if (existingIds) {
          // Keyword already exists, append this rule's ID
          existingIds.push(cryptoKey);
        } else {
          // First occurrence of this keyword, create new array
          map.set(keyword, [cryptoKey]);
        }
      });
    });
  }

  public async importFromComponents(components: Array<NewComponentDTO>) {
    try {
      const p = workspace.getOpenProject();
      if (p.getApiKey()) {
        log.info('[ Cryptography Service ]: Importing cryptography into database');
        const cryptoTask = new AddCryptographyTask();
        const comp = this.adaptToCryptographyTask(components);
        await cryptoTask.run({ components: comp, token: p.getApiKey() });
      }
    }catch (e){
      log.error("[ Cryptography Service ]: ", e);
    }
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
    const libraryRules = await this.getLibraryRules();
    const algorithmRules = await this.getAlgorithmRules();
    // Algorithm
    const algorithms = algorithmRules.filter((rule: any) => keySet.has(rule.algorithmId.toLowerCase()));
    // Library
    const libraries = libraryRules.filter((rule: any) => keySet.has(rule.id.toLowerCase()));

    const keywords: Array<string> = [];
    algorithms.forEach((algorithm) => {
      keywords.push(...(algorithm ? algorithm.keywords : []));
    });
    libraries.forEach((library) => {
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
    const customAlgorithmRulesFilePath = path.join(project.getScanRoot(), AppConfig.SCANOSS_CRYPTO_ALGORITHM_RULES_FILENAME);
    if (await fileExists(customAlgorithmRulesFilePath)) {
      log.info('[ Cryptography Service ] - Custom cryptography algorithm rules found');
      return customAlgorithmRulesFilePath;
    }
    return path.join(this.getAssetPath(), AppConfig.SCANOSS_CRYPTO_ALGORITHM_RULES_FILENAME);
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
    const customLibraryRulesFilePath = path.join(project.getScanRoot(), AppConfig.SCANOSS_CRYPTO_LIBRARY_RULES_FILE_NAME);
    if (await fileExists(customLibraryRulesFilePath)) {
      log.info('[ Cryptography Service ] - Custom cryptography library rules found');
      return customLibraryRulesFilePath;
    }
    return path.join(this.getAssetPath(), AppConfig.SCANOSS_CRYPTO_LIBRARY_RULES_FILE_NAME);
  }

  /**
   * Retrieves a mapping of cryptography keywords to their associated algorithm/library identifiers.
   *
   * This method builds a case-insensitive keyword lookup table by:
   * 1. Loading algorithm rules from the configured algorithm rules file
   * 2. Loading library rules from the configured library rules file
   * 3. Creating a map where each keyword points to all algorithms/libraries that use it
   *
   * The result is cached and only recomputed when the algorithm rules path changes
   * (which indicates a project change or custom rules being loaded).
   *
   * @returns A Map where keys are lowercase keywords and values are arrays of algorithm/library IDs
   *
   * @example
   * ```typescript
   * // Returns Map { 'aes' => ['AES-128', 'AES-256'], 'md5' => ['MD5'] }
   * const keywordMap = await getKeywordsCryptoMap();
   * ```
   */
  public async getKeywordsCryptoMap(): Promise<Map<string, Array<string>>> {
    const algorithmRulesPath = await this.getAlgorithmRulesPath();
    const libraryRulesPath = await this.getLibraryRulesPath();
    // Return cached map if paths haven't changed AND map is not null
    if (algorithmRulesPath == this.lastAlgorithmPath && libraryRulesPath == this.lastLibraryPath && this.cryptoKeywordsMap !== null) {
      return this.cryptoKeywordsMap;
    }
    const cryptoKeywordsMap = new Map<string, Array<string>>();

    const algorithmRules = await this.getAlgorithmRules();
    const libraryRules = await this.getLibraryRules();

    // Process algorithm rules: map keywords to algorithm IDs
    this.addKeywordsToMap(
      cryptoKeywordsMap,
      algorithmRules,
      (rule) => rule.algorithmId
    );

    // Process library rules: map keywords to library IDs
    this.addKeywordsToMap(
      cryptoKeywordsMap,
      libraryRules,
      (rule) => rule.id
    );

    // Cache and return the completed map
    this.cryptoKeywordsMap = cryptoKeywordsMap;
    this.resetCleanupTimer();
    return cryptoKeywordsMap;
  }
}

export const cryptographyService = new CryptographyService();
