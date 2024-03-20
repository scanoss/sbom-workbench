import fs from 'fs';
import log from 'electron-log';
import * as os from 'os';
import { IWorkspaceCfg } from '../../../api/types';
import { userSettingService } from '../../services/UserSettingService';
import AppConfig from '../../../config/AppConfigModule';

const path = require('path');

export async function wsMigration1120(): Promise<void> {
  try {
    const oldWsConfigPath = path.join(os.homedir(), AppConfig.DEFAULT_WORKSPACE_NAME, 'workspaceCfg.json');
    const oldWorkspaceConfig = await fs.promises.readFile(oldWsConfigPath, 'utf8');
    const oldConfig: IWorkspaceCfg = JSON.parse(oldWorkspaceConfig);
    const currentSettings = userSettingService.get();
    const updatedSettings = { ...currentSettings, ...oldConfig, VERSION: '1.12.0' };
    userSettingService.set(updatedSettings);
    await userSettingService.save();
    await fs.promises.unlink(oldWsConfigPath);
  } catch (e: any) {
    console.log(e);
    log.info('Workspace config not found');
  }
}
