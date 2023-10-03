import { userSettingService } from '../../services/UserSettingService';
import fs from 'fs';
import path from 'path';

export async function wsMigration183(): Promise<void> {
  const apis = userSettingService.get().APIS;
  const newApis = apis.map((item) => {
    return {
      ...item,
      URL: item.URL.replace(/\/scan\/direct\/?$/ig, ''),
    };
  });

  userSettingService.setSetting('APIS', newApis);
  userSettingService.setSetting('VERSION', '1.8.3');
  await userSettingService.save();
}

export async function projectMigration183(projectPath): Promise<void> {
  const metadataPath = path.join(projectPath, 'metadata.json');
  const metadataRaw = await fs.promises.readFile(metadataPath, 'utf-8');
  const metadata = JSON.parse(metadataRaw);

  if (metadata?.api) {
    metadata.api = metadata.api.replace(/\/scan\/direct\/?$/ig, '');
    await fs.promises.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
  }
}
