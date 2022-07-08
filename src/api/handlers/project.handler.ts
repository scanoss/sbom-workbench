import { ipcMain } from 'electron';
import { FileTreeViewMode, IWorkbenchFilter } from '../types';
import { IpcChannels } from '../ipc-channels';
import { Response } from '../Response';
import { userSettingService } from '../../main/services/UserSettingService';
import { ProjectFilterPath } from '../../main/workspace/filters/ProjectFilterPath';
import { Project } from '../../main/workspace/Project';
import { workspace } from '../../main/workspace/Workspace';
import { dependencyService } from '../../main/services/DependencyService';
import { ResumeScanTask } from '../../main/task/scanner/ResumeScanTask';
import { ReScanTask } from '../../main/task/scanner/ReScanTask';
import { searcher } from '../../main/modules/searchEngine/searcher/Searcher';

ipcMain.handle(IpcChannels.PROJECT_OPEN_SCAN, async (event, arg: any) => {
  // TO DO factory to create filters depending on arguments
  const p: Project = await workspace.openProject(new ProjectFilterPath(arg));
  searcher.closeIndex();
  const response = {
    logical_tree: p.getTree().getRootFolder(),
    work_root: p.getMyPath(),
    scan_root: p.getScanRoot(),
    dependencies: await dependencyService.getDependenciesFiles(),
    uuid: p.getUUID(),
    source: p.getDto().source,
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
  const resumeScanTask = new ResumeScanTask();
  await resumeScanTask.set(projectPath);
  await resumeScanTask.init();
  await resumeScanTask.run();
});

ipcMain.handle(IpcChannels.PROJECT_RESCAN, async (event, projectPath: string) => {
  try {
    const reScanTask = new ReScanTask();
    await reScanTask.set(projectPath);
    await reScanTask.init();
    await reScanTask.run();
    return Response.ok();
  } catch (error: any) {
    console.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcChannels.UTILS_PROJECT_NAME, async (event) => {
  const projectName = workspace.getOpenedProjects()[0].project_name;
  return { status: 'ok', message: 'Project name retrieve succesfully', data: projectName };
});

ipcMain.handle(IpcChannels.UTILS_GET_NODE_FROM_PATH, (event, path: string) => {
  try {
    const p = workspace.getOpenedProjects()[0];
    const node = p.getTree().getNode(path);
    return Response.ok({ message: 'Node from path retrieve succesfully', data: node });
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
    return Response.ok({ message: 'Node from path retrieve succesfully', data: token });
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
    return Response.ok({ message: 'Filter setted succesfully', data: true });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcChannels.GET_API_KEY, async (event) => {
  try {
    const p = workspace.getOpenedProjects()[0];
    let apiKey = p.getApiKey();
    if (apiKey === undefined) {
      const { APIS, DEFAULT_API_INDEX } = userSettingService.get();
      if (DEFAULT_API_INDEX > 0) apiKey = APIS[DEFAULT_API_INDEX].API_KEY;
      else apiKey = null;
    }
    return Response.ok({ message: '', data: apiKey });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});
