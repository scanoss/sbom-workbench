import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import os from 'os';
import AppConfig from '../../../config/AppConfigModule';
import { DEFAULT_INVENTORY_USAGES, IWorkspaceCfg } from '../../../api/types';
import { userSettingService } from '../../services/UserSettingService';

export async function appMigration1400(projectPath: string): Promise<void> {
  try {
    log.info('%cApp Migration 1.40.0 in progress...', 'color:green');
    const wsConfigPath = path.join(os.homedir(), AppConfig.DEFAULT_SETTING_NAME, 'sbom-workbench-settings.json');
    const wsConfig = await fs.promises.readFile(wsConfigPath, 'utf8');
    const config: IWorkspaceCfg = JSON.parse(wsConfig);

    const customUsages = (config.USAGES ?? []).filter((u) => !DEFAULT_INVENTORY_USAGES.includes(u));
    config.USAGES = [...DEFAULT_INVENTORY_USAGES, ...customUsages];

    config.VERSION = '1.40.0';
    userSettingService.set(config);
    await userSettingService.save();
    log.info('%cApp Migration 1.40.0 finished', 'color:green');
  } catch (e: any) {
    console.log(e);
    log.error('Workspace config not found');
  }
}
