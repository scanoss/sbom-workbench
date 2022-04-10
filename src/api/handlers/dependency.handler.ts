import { ipcMain } from 'electron';
import log from 'electron-log';
import { dependencyService } from '../../main/services/DependencyService';
import { NewDependencyDTO } from '../dto';
import { IpcEvents } from '../ipc-events';
import { Response } from '../Response';
import { Dependency } from '../types';

ipcMain.handle(IpcEvents.DEPENDENCY_GET_ALL, async (event, params: { path: string }) => {
  try {
    const dependencies = await dependencyService.getAll(params);
    return Response.ok({ message: 'Component created successfully', data: dependencies });
  } catch (error: any) {
    log.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.DEPENDENCY_ACCEPT, async (event, params: NewDependencyDTO) => {
  try {
    const dependency = await dependencyService.accept(params);
    return Response.ok({ message: 'Component created successfully', data: dependency });
  } catch (error: any) {
    log.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.DEPENDENCY_RESTORE, async (_event, dependencyId: number) => {
  try {
    const dependency = await dependencyService.restore(dependencyId);
    return Response.ok({ message: 'Component created successfully', data: dependency });
  } catch (error: any) {
    log.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.DEPENDENCY_ACCEPT_ALL, async (event, acceptedDependencies: Array<Dependency>) => {
  try {
    const response = await dependencyService.acceptAll(acceptedDependencies);
    return Response.ok({ message: 'Component created successfully', data: response });
  } catch (error: any) {
    console.log('Catch an error: ', error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.DEPENDENCY_REJECT, async (event, dependencyId: number) => {
  try {
    const response = await dependencyService.reject(dependencyId);
    return Response.ok({ message: 'Component created successfully', data: response });
  } catch (error: any) {
    console.log('Catch an error: ', error);
    return Response.fail({ message: error.message });
  }
});
