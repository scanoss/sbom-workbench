import { Command } from 'commander';
import { app } from 'electron';
import { userSettingService } from '../../../../services/UserSettingService';

export function listCommand(): Command {
  return new Command('list')
    .description('List configured APIs')
    .action(async () => {
      if (!userSettingService.configExists()) {
        console.error('[SCANOSS] No config found. Run "config init" first');
        app.exit(1);
        return;
      }

      await userSettingService.read();
      const settings = userSettingService.get();

      console.log('Configured APIs:');
      (settings.APIS as Array<{ URL: string; API_KEY: string }>).forEach((api, index: number) => {
        const isDefault = index === settings.DEFAULT_API_INDEX ? ' (default)' : '';
        const key = api.API_KEY ? ' [key set]' : '';
        console.log(`[${index}] ${api.URL}${key}${isDefault}`);
      });
      app.quit();
    });
}
