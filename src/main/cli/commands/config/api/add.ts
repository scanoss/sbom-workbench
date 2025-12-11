import { Command } from 'commander';
import { app } from 'electron';
import { userSettingService } from '../../../../services/UserSettingService';
import { normalizeUrl } from '../../../utils';

export function addCommand(): Command {
  return new Command('add')
    .description('Add an API configuration')
    .requiredOption('--url <url>', 'API URL')
    .option('--api-key <key>', 'API key', '')
    .option('--default', 'Set as default API')
    .action(async (options) => {
      if (!userSettingService.configExists()) {
        console.error('[SCANOSS] No config found. Run "config init" first');
        app.exit(1);
        return;
      }

      await userSettingService.read();
      const settings = userSettingService.get();
      const normalizedUrl = normalizeUrl(options.url);

      settings.APIS.push({ URL: normalizedUrl, API_KEY: options.apiKey });

      if (options.default) {
        settings.DEFAULT_API_INDEX = settings.APIS.length - 1;
      }

      userSettingService.set(settings);
      await userSettingService.save();
      console.log(`[SCANOSS] Added API: ${normalizedUrl}`);
      app.quit();
    });
}
