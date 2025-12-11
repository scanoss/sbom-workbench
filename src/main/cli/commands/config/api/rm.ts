import { Command } from 'commander';
import { app } from 'electron';
import { userSettingService } from '../../../../services/UserSettingService';
import { isValidApiIndex } from '../../../utils';

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
      try{
        isValidApiIndex(index,settings.APIS.length)
      }catch (e: any){
        console.error(e.message);
        app.exit(1);
        return;
      }

      const removed = settings.APIS.splice(index, 1);

      // Adjust default index if needed
      if (settings.DEFAULT_API_INDEX >= settings.APIS.length) {
        settings.DEFAULT_API_INDEX = Math.max(0, settings.APIS.length - 1);
      }

      try{
        userSettingService.set(settings);
      }catch (e: any){
        console.error(e.message);
        app.exit(1);
        return;
      }
      await userSettingService.save();
      console.log(`[SCANOSS] Removed API: ${removed[0].URL}`);
      app.quit();
    });
}
