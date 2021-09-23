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


ipcMain.handle(IpcEvents.PROJECT_OPEN_SCAN, async (_event, arg: any) => {
  let created: any;
  console.log(arg);
  ws = workspace;


  // p = new ProjectTree();
  // p.loadFromPath()


  ws.newProject(arg, _event.sender);
  ws.projectsList.openScanProject(arg);

  const response = {
    logical_tree: ws.projectsList.logical_tree,
    work_root: ws.projectsList.work_root,
    results: ws.projectsList.results,
    scan_root: ws.projectsList.scan_root,
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
  const { path } = arg;
  ws = new Workspace();
  ws.newProject(path, _event.sender);
  console.log(ws.projectsList);
  return {
    status: 'ok',
    message: 'Project loaded',
    data: ws, // ws.directory_tree.project,
  };
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
  const projectName = defaultProject.project_name;
      return { status: 'ok', message: 'Project name retrieve succesfully', data: projectName };
});

ipcMain.handle(IpcEvents.UTILS_GET_NODE_FROM_PATH, (event, path: string) => {
  try {
    const node = defaultProject.getNodeFromPath(path);
    return Response.ok({ message: 'Node from path retrieve succesfully', data: node });
  } catch (e) {
    return Response.fail({ message: e.message });
  }
});
