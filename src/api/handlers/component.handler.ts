import api from '../api';
import log from 'electron-log';
import { Component, ComponentGroup, IWorkbenchFilterParams, NewComponentDTO } from '../types';
import { IpcChannels } from '../ipc-channels';
import { Response } from '../Response';
import { componentService } from '../../main/services/ComponentService';
import { ISearchComponent } from '../../main/task/componentCatalog/iComponentCatalog/ISearchComponent';
import { SearchComponentTask } from '../../main/task/componentCatalog/SearchComponentTask';
import { ISearchComponentVersion } from '../../main/task/componentCatalog/iComponentCatalog/ISearchComponentVersion';
import { SearchComponentVersionTask } from '../../main/task/componentCatalog/SearchComponentVersionTask';
api.handle(IpcChannels.COMPONENT_CREATE, async (_event, component: NewComponentDTO) => {
  try {
    const newComp = await componentService.create(component);
    return Response.ok({ message: 'Component created successfully', data: newComp });
  } catch (error: any) {
    log.error('[COMPONENT CREATE]: ', error);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.COMPONENT_GET_FILES, async (_event, component: Component, params: IWorkbenchFilterParams) => {
  try {
    const data = await componentService.getComponentFiles(component, params);
    return Response.ok({ message: 'Component files succesfully retrieved', data });
  } catch (error: any) {
    log.error('[COMPONENT GET FILES]: ', error, params);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.COMPONENT_GET_ALL, async (_event, params: IWorkbenchFilterParams) => {
  try {
    const data = await componentService.getAll(params);
    return Response.ok({ message: 'All components succesfully retrieved', data });
  } catch (error: any) {
    log.error('[COMPONENT GET ALL]: ', error, params);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.COMPONENT_GET, async (_event, component: Partial<ComponentGroup>, params: IWorkbenchFilterParams) => {
  try {
    const data = await componentService.get(component, params);
    return Response.ok({ message: 'Component retrieve successfully', data });
  } catch (error: any) {
    log.error('[COMPONENT GET]: ', error);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.COMPONENT_GET_GLOBAL_COMPONENTS, async (_event, params: ISearchComponent) => {
  try {
    const components = await new SearchComponentTask().run(params);
    return Response.ok({ message: 'Component retrieve successfully', data: components });
  } catch (error: any) {
    log.error('[GET GLOBAL COMPONENTS]: ', error, params);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.COMPONENT_GET_GLOBAL_COMPONENT_VERSION, async (_event, params: ISearchComponentVersion) => {
  try {
    const componentVersions = await new SearchComponentVersionTask().run(params);
    return Response.ok({ message: 'Component retrieve successfully', data: componentVersions });
  } catch (error: any) {
    log.error('[GET GLOBAL COMPONENT VERSION]: ', error, params);
    return Response.fail({ message: error.message });
  }
});
