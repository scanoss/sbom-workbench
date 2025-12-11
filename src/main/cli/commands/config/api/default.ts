import { Command } from 'commander';
import { app } from 'electron';
import { userSettingService } from '../../../../services/UserSettingService';
import { isValidApiIndex } from '../../../utils';

export function defaultCommand(): Command {
  return new Command('default')
    .description('Set default API')
    .requiredOption('--index <index>', 'API index to set as default')
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
      settings.DEFAULT_API_INDEX = index;
      userSettingService.set(settings);
      await userSettingService.save();
      console.log(`[SCANOSS] Default API set to: ${settings.APIS[index].URL}`);
      app.quit();
    });
}
