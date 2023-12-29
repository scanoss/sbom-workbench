import { NewComponentDTO } from '@api/types';
import log from 'electron-log';
import { workspace } from '../workspace/Workspace';
import { AddCryptographyTask } from '../task/cryptography/AddCryptographyTask';
import { modelProvider } from './ModelProvider';
import { componentHelper } from '../helpers/ComponentHelper';

class CryptographyService {
  public async importFromComponents(components: Array<NewComponentDTO>) {
    const p = workspace.getOpenProject();
    if (p.getGlobalApiKey()) {
      log.info('%c[ Crypto ]: Importing cryptography into database', 'color: green');
      const cryptoTask = new AddCryptographyTask();
      const comp = this.adaptToCryptographyTask(components);
      await cryptoTask.run({ components: comp, token: p.getGlobalApiKey() });
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
      if (!p.getGlobalApiKey()) throw new Error('API Key is required');

      const componentVersion = await modelProvider.model.component.getAll(null);
      const dependencyComponents = await modelProvider.model.dependency.getAll(null);

      const components = componentHelper.groupComponentByPurlVersion(
        componentVersion,
        dependencyComponents,
      );

      const cryptographyTask = new AddCryptographyTask();
      await cryptographyTask.run({ components, token: p.getGlobalApiKey(), force: true });

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
}

export const cryptographyService = new CryptographyService();
