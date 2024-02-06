import { ipcMain } from 'electron';
import log from 'electron-log';
import {
  ExtractFromProjectDTO,
  FileTreeViewMode,
  INewProject,
  Inventory,
  InventoryKnowledgeExtraction,
  IProject,
  IWorkbenchFilter,
  ProjectAccessMode,
  ProjectOpenResponse,
  ReuseIdentificationTaskDTO,
} from '../types';
import { IpcChannels } from '../ipc-channels';
import { Response } from '../Response';
import { userSettingService } from '../../main/services/UserSettingService';
import { ProjectFilterPath } from '../../main/workspace/filters/ProjectFilterPath';
import { Project } from '../../main/workspace/Project';
import { workspace } from '../../main/workspace/Workspace';
import { dependencyService } from '../../main/services/DependencyService';
import { searcher } from '../../main/modules/searchEngine/searcher/Searcher';
import { projectService } from '../../main/services/ProjectService';

ipcMain.handle(IpcChannels.PROJECT_OPEN_SCAN, async (event, path: string, mode: ProjectAccessMode = ProjectAccessMode.WRITE) => {
  // TODO: factory to create filters depending on arguments
  const p: Project = await workspace.openProject(new ProjectFilterPath(path));
  searcher.closeIndex();
  await projectService.lockProject(p.getProjectName(), mode);
  const response: ProjectOpenResponse = {
    logical_tree: p.getTree().getRootFolder(),
    work_root: p.getWorkRoot(),
    scan_root: p.getScanRoot(),
    dependencies: Array.from(await dependencyService.getDependenciesFiles()),
    uuid: p.getUUID(),
    source: p.getDto().source,
    metadata: p.metadata,
    mode: mode,
  };
  return {
    status: 'ok',
    message: 'Project loaded',
    data: response,
  };
});

function getUserHome() {
  // Return the value using process.env
  return process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
}

ipcMain.handle(IpcChannels.PROJECT_STOP_SCAN, async (_event) => {
  const projectList = workspace.getOpenedProjects();
  let pPromises = [];
  for (const p of projectList) pPromises.push(p.save());
  await Promise.all(pPromises);

  pPromises = [];
  for (const p of projectList) pPromises.push(p.close());
  await Promise.all(pPromises);
});

ipcMain.handle(IpcChannels.PROJECT_RESUME_SCAN, async (event, projectPath: string) => {
  try {
    await projectService.resume(projectPath);
    return Response.ok();
  } catch (error: any) {
    console.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcChannels.PROJECT_RESCAN, async (event, projectPath: string) => {
  try {
    await projectService.reScan(projectPath);
    return Response.ok();
  } catch (error: any) {
    console.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcChannels.UTILS_PROJECT_NAME, async (event) => {
  const projectName = workspace.getOpenedProjects()[0].project_name;
  return {
    status: 'ok',
    message: 'Project name retrieve succesfully',
    data: projectName,
  };
});

ipcMain.handle(IpcChannels.UTILS_GET_NODE_FROM_PATH, (event, path: string) => {
  try {
    const p = workspace.getOpenedProjects()[0];
    const node = p.getTree().getNode(path);
    return Response.ok({
      message: 'Node from path retrieve succesfully',
      data: node,
    });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcChannels.GET_TOKEN, async (event) => {
  try {
    let token = workspace.getOpenedProjects()[0].getToken();
    if (!token || token === '') {
      const { TOKEN } = userSettingService.get();
      token = TOKEN;
    }
    return Response.ok({
      message: 'Node from path retrieve succesfully',
      data: token,
    });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcChannels.PROJECT_READ_TREE, (event) => {
  try {
    const tree = workspace.getOpenedProjects()[0].getTree().getRootFolder();
    return Response.ok({ message: 'Tree read successfully', data: tree });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcChannels.PROJECT_SET_FILTER, async (event, filter: IWorkbenchFilter) => {
  try {
    const p = workspace.getOpenedProjects()[0];
    await p.setGlobalFilter(filter);
    return Response.ok({ message: 'Filter setted succesfully', data: true });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcChannels.PROJECT_SET_FILE_TREE_VIEW_MODE, async (event, mode: FileTreeViewMode) => {
  try {
    const p = workspace.getOpenedProjects()[0];
    p.setFileTreeViewMode(mode);
    return Response.ok({ message: 'Filter setted successfully', data: true });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcChannels.GET_API_URL, async (event) => {
  try {
    const p = workspace.getOpenProject();
    let apiURL = p.getApi();
    if (apiURL === undefined) {
      const { APIS, DEFAULT_API_INDEX } = userSettingService.get();
      if (DEFAULT_API_INDEX > 0) apiURL = APIS[DEFAULT_API_INDEX].URL;
      else apiURL = null;
    }
    return Response.ok({
      message: 'Api URL loaded successfully',
      data: apiURL,
    });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcChannels.GET_API_KEY, async (event) => {
  try {
    const p = workspace.getOpenProject();
    let apiKey = p.getApiKey();
    if (apiKey === undefined) {
      const { APIS, DEFAULT_API_INDEX } = userSettingService.get();
      if (DEFAULT_API_INDEX > 0) apiKey = APIS[DEFAULT_API_INDEX].API_KEY;
      else apiKey = null;
    }
    return Response.ok({
      message: 'Api Key loaded successfully',
      data: apiKey,
    });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcChannels.PROJECT_CREATE, async (_event, projectDTO: INewProject) => {
  try {
    await projectService.createProject(projectDTO);
    return Response.ok();
  } catch (error: any) {
    log.error('[CREATE PROJECT]', error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcChannels.PROJECT_EXTRACT_INVENTORY_KNOWLEDGE, async (_event, param: ExtractFromProjectDTO) => {
  try {
    const inventoryKnowledgeExtraction: InventoryKnowledgeExtraction = await projectService.extractProjectKnowledgeInventoryData(param);
    return Response.ok({
      message: 'Project extraction successfully',
      data: inventoryKnowledgeExtraction,
    });
  } catch (error: any) {
    log.error('[PROJECT_EXTRACT_INVENTORY_KNOWLEDGE]', error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcChannels.PROJECT_ACCEPT_INVENTORY_KNOWLEDGE, async (_event, param: ReuseIdentificationTaskDTO) => {
  try {
    const inventories: Array<Inventory> = await projectService.acceptInventoryKnowledge(param);
    return Response.ok({
      message: 'Project extraction successfully',
      data: inventories,
    });
  } catch (error: any) {
    log.error('[PROJECT_EXTRACT_INVENTORY_KNOWLEDGE]', error);
    return Response.fail({ message: error.message });
  }
});


ipcMain.handle(IpcChannels.PROJECT_CURRENT_CLOSE, async (_event) => {
  try {
    const project: IProject = await projectService.close();
    return Response.ok({
      message: 'Project Closed',
      data: project,
    });
  } catch (error: any) {
    log.error('[PROJECT_CURRENT_CLOSE]', error);
    return Response.fail({ message: error.message });
  }
});