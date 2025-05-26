import { CryptographyResponseDTO, NewComponentDTO } from '@api/types';
import log from 'electron-log';
import { workspace } from '../workspace/Workspace';
import { AddCryptographyTask } from '../task/cryptography/AddCryptographyTask';
import { modelProvider } from './ModelProvider';
import { componentHelper } from '../helpers/ComponentHelper';
import { SourceType } from '../../api/dto';
import { LocalCryptographyTask } from '../task/scanner/cryptography/LocalCryptographyTask';

class CryptographyService {
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
}

export const cryptographyService = new CryptographyService();
