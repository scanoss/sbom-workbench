import { ipcMain } from 'electron';
import log from 'electron-log';
import { IpcChannels } from '../ipc-channels';
import { workspace } from '../../main/workspace/Workspace';
import { Response } from '../Response';
import { INewProject, IProject, License } from '../types';
import { ProjectFilterPath } from '../../main/workspace/filters/ProjectFilterPath';
import { ProjectZipper } from '../../main/workspace/ProjectZipper';
import { CodeScannerPipelineTask } from '../../main/task/scanner/scannerPipeline/CodeScannerPipelineTask';
import { Scanner } from '../../main/task/scanner/types';
import ScannerSource = Scanner.ScannerSource;
import ScannerType = Scanner.ScannerType;
import { workspaceService } from '../../main/services/WorkspaceService';
import { NewLicenseDTO } from "../dto";

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
  }
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

ipcMain.handle(IpcChannels.WORKSPACE_CREATE_LICENSE, async (_event, newLicense: NewLicenseDTO) => {
  try {
    const licenseCreated = await workspaceService.createLicense(newLicense)
    return Response.ok({
      message: 'License created successfully',
      data: licenseCreated,
    });
  } catch (e: any) {
    log.log('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcChannels.WORKSPACE_GET_ALL_LICENSES, async (_event) => {
  try {
    const licenses = await workspaceService.getAllLicenses();
    return Response.ok({
      message: 'Licenses successfully retrieved',
      data: licenses,
    });
  } catch (e: any) {
    log.log('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});


ipcMain.handle(IpcChannels.WORKSPACE_DELETE_LICENSE, async (_event, id: number) => {
  try {
    const deletedLicense = await workspaceService.deleteLicense(id);
    return Response.ok({
      message: 'License deleted successfully',
      data: deletedLicense,
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
  }
);

ipcMain.handle(
  IpcChannels.WORKSPACE_EXPORT_PROJECT,
  async (_event, pathToSave: string, projectPath: string) => {
    try {
      await new ProjectZipper().export(pathToSave, projectPath);
      return Response.ok({
        message: 'Project exported successfully',
        data: true,
      });
    } catch (e: any) {
      log.error('Catch an error: ', e);
      return Response.fail({ message: e.message });
    }
  }
);
