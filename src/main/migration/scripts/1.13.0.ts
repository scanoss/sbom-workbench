import log from 'electron-log';
import sqlite3 from 'sqlite3';
import { modelProvider } from '../../services/ModelProvider';

export async function projectMigration1130(projectPath: string): Promise<void> {
  log.info('%cProject migration 1.13.0 in progress...', 'color:green');
  modelProvider.openModeProjectModel = sqlite3.OPEN_READWRITE;
  await modelProvider.init(projectPath);
  await modelProvider.model.destroy();
  log.info('%cProject migration 1.13.0 finished', 'color:green');
}
