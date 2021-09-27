import { ipcMain } from 'electron';
import { create } from 'electron-log';
// import { Component } from 'react';
import { Inventory, Component, IProject } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { Response } from './Response';


import { workspace } from './workspace/workspace';
import { defaultProject, Project } from './workspace/Project';

const os = require('os');
const fs = require('fs');

let ws: Workspace;
//export let defaultProject: Project;

ipcMain.handle(IpcEvents.PROJECT_OPEN_SCAN, async (_event, arg: any) => {
  let created: any;


  const p: Project = await workspace.openProjectByPath(arg);

  const response = {
    logical_tree: p.getLogicalTree(),
    work_root: p.getMyPath(),
    results: p.getResults(),
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

ipcMain.handle(IpcEvents.PROJECT_CREATE_SCAN, async (_event, arg: Project) => {

});

ipcMain.handle(IpcEvents.PROJECT_STOP_SCAN, async (_event) => {
  ws = workspace;
  ws.projectsList.stopScanProject();
});

ipcMain.handle(IpcEvents.PROJECT_RESUME_SCAN, async (event, arg: any) => {
  const path = arg;
  ws = workspace;
  ws.projectsList.resumeScanProject(path,event.sender);
});


ipcMain.handle(IpcEvents.UTILS_DEFAULT_PROJECT_PATH, async (event) => {
  try {
    let path = `${os.homedir()}/scanoss-workspace`;
    if (!fs.existsSync(path)){
      path=os.homedir();
    }
      return { status: 'ok', message: 'SPDX export successfully', data: path };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.UTILS_PROJECT_NAME, async (event) => {
  const projectName = workspace.getOpenedProjects()[0].project_name;
      return { status: 'ok', message: 'Project name retrieve succesfully', data: projectName };
});

ipcMain.handle(IpcEvents.UTILS_GET_NODE_FROM_PATH, (event, path: string) => {
  try {
    const node = workspace.getOpenedProjects()[0].getNodeFromPath(path);
    return Response.ok({ message: 'Node from path retrieve succesfully', data: node });
  } catch (e) {
    return Response.fail({ message: e.message });
  }
});
