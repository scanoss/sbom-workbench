import { NewComponentDTO } from '@api/types';
import log from 'electron-log';
import { workspace } from '../workspace/Workspace';
import { AddCryptographyTask } from '../task/cryptography/AddCryptographyTask';

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
}

export const cryptographyService = new CryptographyService();
