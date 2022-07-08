import { ipcMain } from 'electron';
import { IpcChannels } from '../ipc-channels';
import { resultService } from '../../main/services/ResultService';

ipcMain.handle(IpcChannels.RESULTS_GET, async (event, arg: string) => {
  const result = await resultService.getFromPath(arg);
  if (result)
    return {
      status: 'ok',
      message: 'Results succesfully retrieved',
      data: result,
    };
  return { status: 'error', message: 'Files were not successfully retrieved' };
});
