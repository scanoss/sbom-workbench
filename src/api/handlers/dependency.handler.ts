import { ipcMain } from 'electron';
import log from 'electron-log';
import { dependencyService } from '../../main/services/DependencyService';
import { AcceptAllDependeciesDTO, NewDependencyDTO, RejectAllDependeciesDTO, RestoreAllDependenciesDTO } from '../dto';
import { IpcChannels } from '../ipc-channels';
import { Response } from '../Response';
import { treeService } from '../../main/services/TreeService';

ipcMain.handle(IpcChannels.DEPENDENCY_GET_ALL, async (event, params: { path: string }) => {
  try {
    const dependencies = await dependencyService.getAll(params);
    return Response.ok({ message: 'Component created successfully', data: dependencies });
  } catch (error: any) {
    log.error('[DEPENDENCY GET ALL]: ', error, params);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcChannels.DEPENDENCY_ACCEPT, async (event, params: NewDependencyDTO) => {
  try {
    const dependency = await dependencyService.accept(params);
    treeService.updateDependencyStatusOnTree();
    return Response.ok({ message: 'Component created successfully', data: dependency });
  } catch (error: any) {
    log.error('[DEPENDENCY ACCEPT]: ', error, params);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcChannels.DEPENDENCY_RESTORE, async (_event, dependencyId: number) => {
  try {
    const dependency = await dependencyService.restore(dependencyId);
    treeService.updateDependencyStatusOnTree();
    return Response.ok({ message: 'Component created successfully', data: dependency });
  } catch (error: any) {
    log.error('[DEPENDENCY RESTORE]: ', error, dependencyId);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcChannels.DEPENDENCY_RESTORE_ALL, async (_event, params: RestoreAllDependenciesDTO) => {
  try {
    let response = [];
    if (params.path) response = await dependencyService.restoreAllByPath(params.path);
    else response = await dependencyService.restoreAllByIds(params.dependencyIds);
    treeService.updateDependencyStatusOnTree();
    return Response.ok({ message: 'Component created successfully', data: response });
  } catch (error: any) {
    log.error('[DEPENDENCY RESTORE ALL]: ', error, params);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcChannels.DEPENDENCY_ACCEPT_ALL, async (event, params: AcceptAllDependeciesDTO) => {
  try {
    let response;
    if (params.dependencies) response = await dependencyService.acceptAllByIds(params.dependencies);
    else response = await dependencyService.acceptAllByPath(params.path);
    treeService.updateDependencyStatusOnTree();
    return Response.ok({ message: 'Component created successfully', data: response });
  } catch (error: any) {
    log.error('[DEPENDENCY ACCEPT ALL]: ', error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcChannels.DEPENDENCY_REJECT, async (event, dependencyId: number) => {
  try {
    const response = await dependencyService.reject(dependencyId);
    treeService.updateDependencyStatusOnTree();
    return Response.ok({ message: 'Component created successfully', data: response });
  } catch (error: any) {
    log.error('[DEPENDENCY REJECT]: ', error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcChannels.DEPENDENCY_REJECT_ALL, async (event, param: RejectAllDependeciesDTO) => {
  try {
    let response;
    if (param.dependencyIds) response = await dependencyService.rejectAllByIds(param.dependencyIds);
    else response = await dependencyService.rejectAllByPath(param.path);
    treeService.updateDependencyStatusOnTree();
    return Response.ok({ message: 'Component created successfully', data: response });
  } catch (error: any) {
    log.error('[DEPENDENCY REJECT ALL]: ', error);
    return Response.fail({ message: error.message });
  }
});
