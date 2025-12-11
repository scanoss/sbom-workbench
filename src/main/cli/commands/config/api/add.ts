import { Command } from 'commander';
import { app } from 'electron';
import { userSettingService } from '../../../../services/UserSettingService';
import { validateURL } from '../../../utils';

export function addCommand(): Command {
  return new Command('add')
    .description('Add an API configuration')
    .requiredOption('--url <url>', 'API URL')
    .option('--key <key>', 'API key', '')
    .option('--default', 'Set as default API')
    .action(async (options) => {
      if (!userSettingService.configExists()) {
        console.error('[SCANOSS] No config found. Run "config init" first');
        app.exit(1);
        return;
      }

      await userSettingService.read();
      const settings = userSettingService.get();

      try {
        validateURL(options.url);
      } catch (e: any){
        console.error(`[SCANOSS]: ${e.message}`);
        app.exit(1);
        return;
      }

      settings.APIS.push({ URL: options.url, API_KEY: options.key });

      if (options.default) {
        settings.DEFAULT_API_INDEX = settings.APIS.length - 1;
      }

      userSettingService.set(settings);
      await userSettingService.save();
      console.log(`[SCANOSS] Added API: ${options.url}`);
      app.quit();
    });
}
