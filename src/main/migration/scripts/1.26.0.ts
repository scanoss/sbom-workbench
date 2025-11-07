import log from 'electron-log';
import path from 'path';
import os from 'os';
import AppConfig from '../../../config/AppConfigModule';
import fs from 'fs';
import { IWorkspaceCfg } from '../../../api/types';
import { userSettingService } from '../../services/UserSettingService';

export async function appMigration1260(): Promise<void> {
  try {
    log.info('%cApp Migration 1.26.0 in progress...', 'color:green');
    const wsConfigPath = path.join(os.homedir(), AppConfig.DEFAULT_SETTING_NAME, 'sbom-workbench-settings.json');
    const wsConfig = await fs.promises.readFile(wsConfigPath, 'utf8');
    const config: IWorkspaceCfg = JSON.parse(wsConfig);

    config.APIS.forEach((api) => {
      const apiUrl = new URL(api.URL);
      api.URL = apiUrl.origin;
    })

    config.VERSION = '1.26.0';
    userSettingService.set(config);
    await userSettingService.save();
    log.info('%cApp Migration 1.26.0 finished', 'color:green');
  } catch (e: any) {
    console.log(e);
    log.error('Workspace config not found');
  }
}
