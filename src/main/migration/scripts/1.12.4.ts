import fs from 'fs';
import log from 'electron-log';
import * as os from 'os';
import { IWorkspaceCfg } from '../../../api/types';
import { userSettingService } from '../../services/UserSettingService';
import AppConfig from '../../../config/AppConfigModule';

const path = require('path');

const deprecatedOsskbAPI = 'https://osskb.org/api';
const deprecatedScanossAPI = 'https://scanoss.com/api';

const newSCANOSSAPI = 'https://api.scanoss.com';

export async function appMigration1124(): Promise<void> {
  try {
    log.info('%cApp Migration 1.12.4 in progress...', 'color:green');
    const wsConfigPath = path.join(os.homedir(), AppConfig.DEFAULT_SETTING_NAME, 'sbom-workbench-settings.json');
    const wsConfig = await fs.promises.readFile(wsConfigPath, 'utf8');
    const config: IWorkspaceCfg = JSON.parse(wsConfig);
    config.APIS.forEach((api) => {
      // Set new OSSKB API URL
      if (api.URL === deprecatedOsskbAPI) api.URL = AppConfig.API_URL;

      // Set new SCANOSS API URL
      if (api.URL === deprecatedScanossAPI) api.URL = newSCANOSSAPI;
    });

    config.VERSION = '1.12.4';

    userSettingService.set(config);

    await userSettingService.save();
    log.info('%cApp Migration 1.12.4 finished', 'color:green');
  } catch (e: any) {
    console.log(e);
    log.info('Workspace config not found');
  }
}

export async function projectMigration1124(projectPath: string): Promise<void> {
  log.info('%cProject migration 1.12.4 in progress...', 'color:green');
  const pMetadata = await fs.promises.readFile(path.join(projectPath, 'metadata.json'), 'utf8');
  const metadata = JSON.parse(pMetadata);
  if (metadata.api) {
    if (metadata.api === deprecatedOsskbAPI) {
      metadata.api = AppConfig.API_URL;
    }

    if (metadata.api === deprecatedScanossAPI) {
      metadata.api = newSCANOSSAPI;
    }
    await fs.promises.writeFile(path.join(projectPath, 'metadata.json'), JSON.stringify(metadata), 'utf-8');
  }

  log.info('%cProject migration 1.12.4 finished', 'color:green');
}
