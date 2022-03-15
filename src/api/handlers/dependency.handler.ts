import { ipcMain } from 'electron';
import { dependencyService } from '../../main/services/DependencyService';
import { IpcEvents } from '../ipc-events';
import { Response } from '../Response';

ipcMain.handle(IpcEvents.DEPENDENCY_GET_ALL, async (event, params: any) => {
  try {
    const dependencies = await dependencyService.getAll(params);
    return Response.ok({ message: 'Component created successfully', data: dependencies });
  } catch (error: any) {
    console.log('Catch an error: ', error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.DEPENDENCY_ACCEPT, async (event, params: any) => {
  try {
    const dependency = await dependencyService.accept(params);
    return Response.ok({ message: 'Component created successfully', data: dependency });
  } catch (error: any) {
    console.log('Catch an error: ', error);
    return Response.fail({ message: error.message });
  }
});
