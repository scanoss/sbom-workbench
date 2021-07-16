import { ipcMain } from 'electron';
import { create } from 'electron-log';
// import { Component } from 'react';
import { Inventory, Component, Project } from '../api/types';
import { IpcEvents } from '../ipc-events';

import { Workspace } from './workspace/workspace';

const os = require('os');
const fs = require('fs');

let ws: Workspace;
ipcMain.handle(IpcEvents.PROJECT_LOAD_SCAN, async (_event, arg: any) => {
  let created: any;
  console.log(arg);
  ws = new Workspace();
  ws.newProject(arg);
  ws.projectsList.loadScanProject(arg);
  // console.log(ws.projectsList.logical_tree);
  return {
    status: 'ok',
    message: 'Project loaded',
    data: ws.projectsList,
  };
});

function getUserHome() {
  // Return the value using process.env
  return process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
}

ipcMain.handle(IpcEvents.PROJECT_CREATE_SCAN, async (_event, arg: Project) => {
  const { path } = arg;
  console.log(arg);
  ws = new Workspace();
  ws.newProject(path);
  console.log(ws.projectsList);
  return {
    status: 'ok',
    message: 'Project loaded',
    data: ws, // ws.directory_tree.project,
  };
});
