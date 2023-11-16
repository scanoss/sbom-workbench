import log from 'electron-log';
import { AddCryptographyTask } from '../../task/cryptography/AddCryptographyTask';
import { workspace } from '../../workspace/Workspace';

export async function AddCrypto(data: any) {
  const p = workspace.getOpenProject();
  if (p.getGlobalApiKey()) {
    log.info('%c[ Crypto ]: Importing cryptography into database', 'color: green');
    const cryptoTask = new AddCryptographyTask();
    await cryptoTask.run({ components: [`${data.purl}@${data.versions[0].version}`], token: p.getGlobalApiKey() });
  }
}
