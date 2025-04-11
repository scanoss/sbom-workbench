import { CryptographyResponseDTO, NewComponentDTO } from '@api/types';
import log from 'electron-log';
import { workspace } from '../workspace/Workspace';
import { AddCryptographyTask } from '../task/cryptography/AddCryptographyTask';
import { modelProvider } from './ModelProvider';
import { componentHelper } from '../helpers/ComponentHelper';
import { SourceType } from '../../api/dto';

class CryptographyService {
  public async importFromComponents(components: Array<NewComponentDTO>) {
    const p = workspace.getOpenProject();
    if (p.getApiKey()) {
      log.info('%c[ Crypto ]: Importing cryptography into database', 'color: green');
      const cryptoTask = new AddCryptographyTask();
      const comp = this.adaptToCryptographyTask(components);
      await cryptoTask.run({ components: comp, token: p.getApiKey() });
    }
  }

  private adaptToCryptographyTask(components: NewComponentDTO[]): Array<string> {
    const response = components
      .flatMap((component: NewComponentDTO) => component.versions.map((v) => `${component.purl}@${v.version}`));

    return response;
  }

  public async update() {
    try {
      const p = workspace.getOpenProject();

      if (!p.getApiKey()) {
        return {
          identified: [],
          detected: [],
        };
      }

      const componentVersion = await modelProvider.model.component.getAll(null);
      const dependencyComponents = await modelProvider.model.dependency.getAll(null);

      const components = componentHelper.groupComponentByPurlVersion(
        componentVersion,
        dependencyComponents,
      );

      const cryptographyTask = new AddCryptographyTask();
      await cryptographyTask.run({ components, token: p.getApiKey(), force: true });

      const detected = await modelProvider.model.cryptography.findAllDetected();
      const identified = await modelProvider.model.cryptography.findAllIdentifiedMatched();
      return {
        identified,
        detected,
      };
    } catch (e: any) {
      throw new Error(`Error updating cryptography: cause: ${e.message}`);
    }
  }

  public async getAll(type: SourceType): Promise<CryptographyResponseDTO> {
    const response = type === SourceType.detected
      ? await this.getDetected()
      : await this.getIdentified();
    return response;
  }

  private async getDetected(): Promise<CryptographyResponseDTO> {
    try {
      const components = await modelProvider.model.cryptography.findAllDetectedGroupByType();
      const files = await modelProvider.model.localCryptography.findAllDetectedGroupByType();
      return {
        files,
        components,
        summary: {
          files: {},
          components: {},
        },
      };
    } catch (e: any) {
      throw new Error(`Error retrieving detected cryptography: cause: ${e.message}`);
    }
  }

  private async getIdentified(): Promise<CryptographyResponseDTO> {
    try {
      const components = await modelProvider.model.cryptography.findAllIdentifiedGroupByType();
      const files = await modelProvider.model.localCryptography.findAllIdentifiedGroupByType();
      return {
        files,
        components,
        summary: {
          components: {},
          files: {},
        },
      };
    } catch (e: any) {
      throw new Error(`Error retrieving identified cryptography: cause: ${e.message}`);
    }
  }
}

export const cryptographyService = new CryptographyService();
