import { projectService } from '../api/project-service';
import { IpcEvents } from '../ipc-events';

const { ipcRenderer } = require('electron');

export const scan = (path: string) => {
  ipcRenderer.send(IpcEvents.SCANNER_INIT_SCAN, { path });
};

export const resume = async (path: string) => {
  const response = await projectService.resume(path);

};


export const open = async (path: string) => {
   const response = await projectService.load(path);
   return response;
};

export const defaultWorkspacePath = async () => {
  const response = await projectService.workspacePath();
  return response;
};
