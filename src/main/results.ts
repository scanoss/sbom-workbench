import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { logicResultService } from './services/LogicResultService';

ipcMain.handle(IpcEvents.RESULTS_GET, async (event, arg: string) => {
  const result = await logicResultService.getFromPath(arg);
  if (result)
    return {
      status: 'ok',
      message: 'Results succesfully retrieved',
      data: result,
    };
  return { status: 'error', message: 'Files were not successfully retrieved' };
});
