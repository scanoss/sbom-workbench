import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { Response } from './Response';
import { userSetting } from './UserSetting';
import { ProjectFilterPath } from './workspace/filters/ProjectFilterPath';
import { Project } from './workspace/Project';
import { workspace } from './workspace/Workspace';

ipcMain.handle(IpcEvents.PROJECT_OPEN_SCAN, async (event, arg: any) => {
  let created: any;

  // TO DO factory to create filters depending on arguments
  const p: Project = await workspace.openProject(new ProjectFilterPath(arg));
  p.setMailbox(event.sender);

  const response = {
    logical_tree: p.getTree().getRootFolder(),
    work_root: p.getMyPath(),
    scan_root: p.getScanRoot(),
    dependencies: await p.getDependencies(),
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
  for (let p of projectList) pPromises.push(p.save());
  await Promise.all(pPromises);

  pPromises = [];
  for (let p of projectList) pPromises.push(p.close());
  await Promise.all(pPromises);
});

ipcMain.handle(IpcEvents.PROJECT_RESUME_SCAN, async (event, arg: any) => {
  const path = arg;
  const p: Project = workspace.getProject(new ProjectFilterPath(path));
  p.setMailbox(event.sender);
  await p.resumeScanner();
});

ipcMain.handle(IpcEvents.PROJECT_RESCAN, async (event, projectPath: string) => {
  try {
    const p = workspace.getProject(new ProjectFilterPath(projectPath));
    p.setMailbox(event.sender);
    await p.upgrade();
    await p.reScan();
    return Response.ok();
  } catch (error: any) {
    console.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.UTILS_PROJECT_NAME, async (event) => {
  const projectName = workspace.getOpenedProjects()[0].project_name;
  return { status: 'ok', message: 'Project name retrieve succesfully', data: projectName };
});

ipcMain.handle(IpcEvents.UTILS_GET_NODE_FROM_PATH, (event, path: string) => {
  try {
    const p = workspace.getOpenedProjects()[0];
    const node = p.getTree().getNode(path);
    return Response.ok({ message: 'Node from path retrieve succesfully', data: node });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcEvents.GET_TOKEN, async (event) => {
  try {
    let token = workspace.getOpenedProjects()[0].getToken();
    if (!token || token === '') {
      const { TOKEN } = userSetting.get();
      token = TOKEN;
    }
    return Response.ok({ message: 'Node from path retrieve succesfully', data: token });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcEvents.PROJECT_READ_TREE, (event) => {
  try {
    const tree = workspace.getOpenedProjects()[0].getTree().getRootFolder();
    return Response.ok({ message: 'Tree read successfully', data: tree });
  } catch (e: any) {
    return Response.fail({ message: e.message });
  }
});
