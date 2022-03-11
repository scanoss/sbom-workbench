import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { Response } from './Response';
import { logicDependencyService } from './services/LogicDependencyService';

ipcMain.handle(IpcEvents.DEPENDENCY_GET_ALL, async (event, params: any) => {
  try {
    const dependencies = await logicDependencyService.getAll(params);
    return Response.ok({ message: 'Component created successfully', data: dependencies });
  } catch (error: any) {
    console.log('Catch an error: ', error);
    return Response.fail({ message: error.message });
  }
});
