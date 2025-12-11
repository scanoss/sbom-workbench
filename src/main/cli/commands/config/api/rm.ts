import { Command } from 'commander';
import { app } from 'electron';
import { userSettingService } from '../../../../services/UserSettingService';

export function rmCommand(): Command {
  return new Command('rm')
    .description('Remove an API configuration')
    .requiredOption('--index <index>', 'API index to remove')
    .action(async (options) => {
      if (!userSettingService.configExists()) {
        console.error('[SCANOSS] No config found. Run "config init" first');
        app.exit(1);
        return;
      }

      await userSettingService.read();
      const settings = userSettingService.get();
      const index = parseInt(options.index, 10);

      if (index < 0 || index >= settings.APIS.length) {
        console.error(`[SCANOSS] Invalid index: ${index}`);
        app.exit(1);
        return;
      }

      const removed = settings.APIS.splice(index, 1);

      // Adjust default index if needed
      if (settings.DEFAULT_API_INDEX >= settings.APIS.length) {
        settings.DEFAULT_API_INDEX = Math.max(0, settings.APIS.length - 1);
      }

      userSettingService.set(settings);
      await userSettingService.save();
      console.log(`[SCANOSS] Removed API: ${removed[0].URL}`);
      app.quit();
    });
}
