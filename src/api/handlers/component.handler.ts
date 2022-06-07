import { ipcMain } from 'electron';
import log from 'electron-log';
import { Component, ComponentGroup, IWorkbenchFilterParams } from '../types';
import { IpcEvents } from '../ipc-events';
import { Response } from '../Response';
import { componentService } from '../../main/services/ComponentService';
import { ISearchComponent } from '../../main/task/componentCatalog/iComponentCatalog/ISearchComponent';
import { SearchComponentTask } from '../../main/task/componentCatalog/SearchComponentTask';
import { ISearchComponentVersion } from '../../main/task/componentCatalog/iComponentCatalog/ISearchComponentVersion';
import { SearchComponentVersionTask } from '../../main/task/componentCatalog/SearchComponentVersionTask';

ipcMain.handle(IpcEvents.COMPONENT_CREATE, async (_event, component: Component) => {
  try {
    const newComp = await componentService.create(component);
    return Response.ok({ message: 'ComponentCatalog created successfully', data: newComp });
  } catch (error: any) {
    log.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.COMPONENT_GET_FILES, async (_event, component: Component, params: IWorkbenchFilterParams) => {
  try {
    const data = await componentService.getComponentFiles(component, params);
    return Response.ok({ message: 'ComponentCatalog files succesfully retrieved', data });
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
      return Response.ok({ message: 'ComponentCatalog retrieve successfully', data });
    } catch (error: any) {
      log.error(error);
      return Response.fail({ message: error.message });
    }
  }
);

ipcMain.handle(IpcEvents.COMPONENT_GET_GLOBAL_COMPONENTS, async (_event, params: ISearchComponent) => {
  try {
    const components = await new SearchComponentTask().run(params);
    return Response.ok({ message: 'ComponentCatalog retrieve successfully', data: components });
  } catch (error: any) {
    log.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.COMPONENT_GET_GLOBAL_COMPONENT_VERSION, async (_event, params: ISearchComponentVersion) => {
  try {
    const componentVersions = await new SearchComponentVersionTask().run(params);
    return Response.ok({ message: 'ComponentCatalog retrieve successfully', data: componentVersions });
  } catch (error: any) {
    log.error(error);
    return Response.fail({ message: error.message });
  }
});
