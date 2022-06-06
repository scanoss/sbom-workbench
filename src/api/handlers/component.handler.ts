import { ipcMain } from 'electron';
import log from 'electron-log';
import { Component, ComponentGroup, IWorkbenchFilterParams } from '../types';
import { IpcEvents } from '../ipc-events';
import { Response } from '../Response';
import { componentService } from '../../main/services/ComponentService';
import { ISearchgRPCComponent } from '../../main/task/Component/IComponent/ISearchgRPCComponent';
import { ComponentgRPCTask } from '../../main/task/Component/ComponentgRPCTask';

ipcMain.handle(IpcEvents.COMPONENT_CREATE, async (_event, component: Component) => {
  try {
    const newComp = await componentService.create(component);
    return Response.ok({ message: 'Component created successfully', data: newComp });
  } catch (error: any) {
    log.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.COMPONENT_GET_FILES, async (_event, component: Component, params: IWorkbenchFilterParams) => {
  try {
    const data = await componentService.getComponentFiles(component, params);
    return Response.ok({ message: 'Component files succesfully retrieved', data });
  } catch (error: any) {
    log.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.COMPONENT_GET_ALL, async (_event, params: IWorkbenchFilterParams) => {
  try {
    const data = await componentService.getAll(params);
    return Response.ok({ message: 'All components succesfully retrieved', data });
  } catch (error: any) {
    log.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(
  IpcEvents.COMPONENT_GET,
  async (_event, component: Partial<ComponentGroup>, params: IWorkbenchFilterParams) => {
    try {
      const data = await componentService.get(component, params);
      return Response.ok({ message: 'Component retrieve successfully', data });
    } catch (error: any) {
      log.error(error);
      return Response.fail({ message: error.message });
    }
  }
);

ipcMain.handle(IpcEvents.COMPONENT_GET_GLOBAL_COMPONENTS, async (_event, params: ISearchgRPCComponent) => {
  try {
    const components = await new ComponentgRPCTask().run(params);
    return Response.ok({ message: 'Component retrieve successfully', data: components });
  } catch (error: any) {
    log.error(error);
    return Response.fail({ message: error.message });
  }
});
