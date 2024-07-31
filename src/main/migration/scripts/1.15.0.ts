import log from 'electron-log';
import path from 'path';
import os from 'os';
import AppConfig from '../../../config/AppConfigModule';
import fs from 'fs';
import { IWorkspaceCfg } from '../../../api/types';
import { userSettingService } from '../../services/UserSettingService';

export async function appMigration1150(): Promise<void> {
  try {
    log.info('%cApp Migration 1.15.0 in progress...', 'color:green');
    const wsConfigPath = path.join(os.homedir(), AppConfig.DEFAULT_SETTING_NAME, 'sbom-workbench-settings.json');
    const wsConfig = await fs.promises.readFile(wsConfigPath, 'utf8');
    const config: IWorkspaceCfg = JSON.parse(wsConfig);

    // @ts-ignore
    if (config?.PROXY) {
      // @ts-ignore
      config.HTTP_PROXY = config.PROXY;
      // @ts-ignore
      config.HTTPS_PROXY = config.PROXY;
      // @ts-ignore
      config.PROXY=null;
    }

    // @ts-ignore
    if (config?.PAC) {
      // @ts-ignore
      config.PAC_PROXY = config.PAC;
      // @ts-ignore
      config.PAC = null;
    }




    config.VERSION = '1.15.0';
    userSettingService.set(config);
    await userSettingService.save();
    log.info('%cApp Migration 1.15.0 finished', 'color:green');
  } catch (e: any) {
    console.log(e);
    log.info('Workspace config not found');
  }
}
