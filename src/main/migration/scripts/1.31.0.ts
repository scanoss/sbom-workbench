import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import os from 'os';
import AppConfig from '../../../config/AppConfigModule';
import { IWorkspaceCfg } from '../../../api/types';
import { userSettingService } from '../../services/UserSettingService';
import appConfigModule from '../../../config/AppConfigModule';
import { toPosix } from '../../utils/utils';
import { Metadata } from '../../workspace/Metadata';

export async function appMigration1310(projectPath: string): Promise<void> {
  try {
    log.info('%cApp Migration 1.31.0 in progress...', 'color:green');
    const wsConfigPath = path.join(os.homedir(), AppConfig.DEFAULT_SETTING_NAME, 'sbom-workbench-settings.json');
    const wsConfig = await fs.promises.readFile(wsConfigPath, 'utf8');
    const config: IWorkspaceCfg = JSON.parse(wsConfig);
    for (const w of config.WORKSPACES) {
      const scanSourcesPath = toPosix(path.join(w.PATH, appConfigModule.SCANOSS_SCAN_SOURCES_FOLDER_NAME));
      try{
        await fs.promises.mkdir(scanSourcesPath, { recursive: true });
      }catch(e: any){
        log.error(e.message);
      }
      w.PATH = toPosix(w.PATH);
      w.SCAN_SOURCES = scanSourcesPath;
    }
    config.VERSION = '1.31.0';
    userSettingService.set(config);
    await userSettingService.save();
    log.info('%cApp Migration 1.31.0 finished', 'color:green');
  } catch (e: any) {
    console.log(e);
    log.error('Workspace config not found');
  }
}

export async function projectMigration1310(projectPath: string): Promise<void> {
  try {
    log.info('%cProject Migration 1.31.0 in progress...', 'color:green');
    const pMetadata = await Metadata.readFromPath(projectPath);
    if (pMetadata.getSourceCodePath()){
      pMetadata.setSourceCodePath(pMetadata.getSourceCodePath());
    }
    if(pMetadata.getScanRoot()){
      pMetadata.setScanRoot(pMetadata.getScanRoot());
    }
    pMetadata.save();
    log.info('%cProject Migration 1.31.0 finished', 'color:green');
  } catch (e: any) {
    log.error(e.message);
  }
}
