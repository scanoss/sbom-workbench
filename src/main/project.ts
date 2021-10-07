import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { Response } from './Response';
import { Project } from './workspace/Project';
import { workspace } from './workspace/Workspace';



ipcMain.handle(IpcEvents.PROJECT_OPEN_SCAN, async (_event, arg: any) => {
  let created: any;

  const p: Project = await workspace.openProjectByPath(arg);
  const r = await p.getResults();

  const response = {
    logical_tree: p.getLogicalTree(),
    work_root: p.getMyPath(),
    results: r,
    scan_root: p.getScanRoot(),
    uuid: p.getUUID(),
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

ipcMain.handle(IpcEvents.PROJECT_CREATE_SCAN, async (event, arg: Project) => {
  const { path } = arg;

  const projectName = basepath.basename(path);
  const p: Project = new Project(projectName);
  await workspace.addProject(p);
  p.setScanPath(path);
  p.setMailbox(event.sender);
  await p.startScanner();
});

ipcMain.handle(IpcEvents.PROJECT_STOP_SCAN, async (_event) => {
  const projectList = workspace.getOpenedProjects();
  let pPromises = [];
  for(let p of projectList) pPromises.push(p.save());
  await Promise.all(pPromises);

  pPromises = [];
  for(let p of projectList) pPromises.push(p.close());
  await Promise.all(pPromises);

});

ipcMain.handle(IpcEvents.PROJECT_RESUME_SCAN, async (event, arg: any) => {
  const path = arg;
  const p: Project = workspace.getProjectByPath(path);
  p.setMailbox(event.sender);
  await p.resumeScanner();
});

ipcMain.handle(IpcEvents.UTILS_PROJECT_NAME, async (event) => {
  const projectName = workspace.getOpenedProjects()[0].project_name;
  return { status: 'ok', message: 'Project name retrieve succesfully', data: projectName };
});

ipcMain.handle(IpcEvents.UTILS_GET_NODE_FROM_PATH, (event, path: string) => {
  try {
    const node = workspace.getOpenedProjects()[0].getNodeFromPath(path);
    return Response.ok({ message: 'Node from path retrieve succesfully', data: node });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcEvents.GET_TOKEN, (event) => {
  try {
    const token = workspace.getOpenedProjects()[0].getToken();
    return Response.ok({ message: 'Node from path retrieve succesfully', data: token });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});
