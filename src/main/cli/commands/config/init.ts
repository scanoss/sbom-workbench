import { Command } from 'commander';
import { app } from 'electron';
import { userSettingService } from '../../../services/UserSettingService';

export function initCommand(): Command {
  return new Command('init')
    .description('Initialize default configuration')
    .action(async () => {
      if (userSettingService.configExists()) {
        console.error('[SCANOSS] Config already exists');
        app.exit(1);
        return;
      }
      await userSettingService.read();
      console.log('[SCANOSS] Config initialized');
      app.quit();
    });
}