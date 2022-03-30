import { ipcMain } from 'electron';
import log from 'electron-log';
import { dependencyService } from '../../main/services/DependencyService';
import { IpcEvents } from '../ipc-events';
import { Response } from '../Response';

ipcMain.handle(IpcEvents.DEPENDENCY_GET_ALL, async (_event, params: any) => {
  try {
    const dependencies = await dependencyService.getAll(params);
    return Response.ok({ message: 'Component created successfully', data: dependencies });
  } catch (error: any) {
    log.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.DEPENDENCY_ACCEPT, async (_event, params: any) => {
  try {
    const dependency = await dependencyService.accept(params);
    return Response.ok({ message: 'Component created successfully', data: dependency });
  } catch (error: any) {
    log.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.DEPENDENCY_REJECT, async (_event, dependencyId: number) => {
  try {
    const dependency = await dependencyService.reject(dependencyId);
    return Response.ok({ message: 'Component created successfully', data: dependency });
  } catch (error: any) {
    log.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.DEPENDENCY_ACCEPT_ALL, async (event, depFilePath: string) => {
  try {
    const response = await dependencyService.acceptAll(depFilePath);
    return Response.ok({ message: 'Component created successfully', data: response });
  } catch (error: any) {
    console.log('Catch an error: ', error);
    return Response.fail({ message: error.message });
  }
});

