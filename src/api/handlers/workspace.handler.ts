import { ipcMain } from 'electron';
import log from 'electron-log';
import path from 'path';
import { IpcChannels } from '../ipc-channels';
import { workspace } from '../../main/workspace/Workspace';
import { Response } from '../Response';
import { IProject, License } from '../types';
import { ProjectFilterPath } from '../../main/workspace/filters/ProjectFilterPath';
import { ProjectZipper } from '../../main/workspace/ProjectZipper';

ipcMain.handle(IpcChannels.WORKSPACE_PROJECT_LIST, async (_event) => {
  try {
    const projects = await workspace.getProjectsDtos();
    return Response.ok({
      message: 'Projects list retrieved successfully',
      data: projects,
    });
  } catch (error: any) {
    log.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(
  IpcChannels.WORKSPACE_DELETE_PROJECT,
  async (_event, projectPath: string) => {
    try {
      await workspace.removeProjectFilter(new ProjectFilterPath(projectPath));
      return Response.ok();
    } catch (error: any) {
      log.error(error);
      return Response.fail({ message: error.message });
    }
  },
);

ipcMain.handle(IpcChannels.UTILS_GET_PROJECT_DTO, async (_event) => {
  try {
    const path: IProject = workspace.getOpenedProjects()[0].getDto();
    return Response.ok({
      message: 'Project path successfully retrieved',
      data: path,
    });
  } catch (e: any) {
    log.error(e);
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcChannels.GET_LICENSES, async (_event) => {
  try {
    const licenses: Array<License> = workspace.getLicenses();
    return Response.ok({
      message: 'Project path successfully retrieved',
      data: licenses,
    });
  } catch (e: any) {
    log.log('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(
  IpcChannels.WORKSPACE_IMPORT_PROJECT,
  async (_event, zippedProjectPath: string) => {
    try {
      const Iproject = await new ProjectZipper().import(zippedProjectPath);
      return Response.ok({
        message: 'Project imported successfully',
        data: Iproject,
      });
    } catch (e: any) {
      log.error('Catch an error: ', e);
      return Response.fail({ message: e.message });
    }
  },
);

ipcMain.handle(
  IpcChannels.WORKSPACE_EXPORT_PROJECT,
  async (_event, pathToSave: string, projectPath: string) => {
    try {
      await new ProjectZipper().export(pathToSave, path.join(workspace.getMyPath(), projectPath));
      return Response.ok({
        message: 'Project exported successfully',
        data: true,
      });
    } catch (e: any) {
      log.error('Catch an error: ', e);
      return Response.fail({ message: e.message });
    }
  },
);
