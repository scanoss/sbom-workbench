import fs from 'fs';
import log from 'electron-log';
import * as os from 'os';
import AppConfig from '../../../config/AppConfigModule';
import { userSettingService } from '../../services/UserSettingService';

const path = require('path');

export async function appMigration1123(): Promise<void> {
  try {
    const defaultWorkspacePath = path.join(os.homedir(), AppConfig.DEFAULT_WORKSPACE_NAME);

    const workspaceStuff = await fs.promises.readdir(defaultWorkspacePath, { withFileTypes: true }).catch((e) => {
      log.info(`%c[ WORKSPACE ]: Cannot read the workspace directory ${defaultWorkspacePath}`, 'color: green');
      log.error(e);
      throw e;
    });
    const projectsDirEnt = workspaceStuff.filter((dirent) => !dirent.isSymbolicLink() && !dirent.isFile());
    const projectPaths = projectsDirEnt.map((dirent) => `${defaultWorkspacePath}/${dirent.name}`);

    for (let i = 0; i < projectPaths.length; i++) {
      const metadata = await fs.promises.readFile(path.join(projectPaths[i], 'metadata.json'), 'utf-8');
      const m = JSON.parse(metadata);
      m.work_root = m.name;
      await fs.promises.writeFile(path.join(projectPaths[i], 'metadata.json'), JSON.stringify(m), 'utf-8');
    }

    userSettingService.setSetting('VERSION', '1.12.3');
    await userSettingService.save();
  } catch (e: any) {
    log.error('Migration 1.12.3 failed', e);
  }
}
