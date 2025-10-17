import log from 'electron-log';
import path from 'path';
import { GroupSearchKeywordDTO } from '@api/dto';
import api from '../api';
import { IpcChannels } from '../ipc-channels';
import { workspace } from '../../main/workspace/Workspace';
import { Response } from '../Response';
import { IProject, License } from '../types';
import { ProjectFilterPath } from '../../main/workspace/filters/ProjectFilterPath';
import { ProjectZipper } from '../../main/workspace/ProjectZipper';
import { workspaceService } from '../../main/services/WorkspaceService';

api.handle(IpcChannels.WORKSPACE_PROJECT_LIST, async (_event) => {
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

api.handle(IpcChannels.WORKSPACE_DELETE_PROJECT, async (_event, projectPath: string) => {
  try {
    await workspace.removeProjectFilter(new ProjectFilterPath(projectPath));
    return Response.ok();
  } catch (error: any) {
    log.error(error);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.UTILS_GET_PROJECT_DTO, async (_event) => {
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

api.handle(IpcChannels.GET_LICENSES, async (_event) => {
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

api.handle(IpcChannels.WORKSPACE_IMPORT_PROJECT, async (_event, zippedProjectPath: string, sourceCodePath:string | null) => {
  try {
    const Iproject = await new ProjectZipper().import(zippedProjectPath, sourceCodePath);
    return Response.ok({
      message: 'Project imported successfully',
      data: Iproject,
    });
  } catch (e: any) {
    log.error('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

api.handle(IpcChannels.WORKSPACE_EXPORT_PROJECT, async (_event, pathToSave: string, projectPath: string) => {
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
});

api.handle(IpcChannels.WORKSPACE_SET_CURRENT, async (_event, wsPath: string) => {
  try {
    await workspaceService.setCurrent(wsPath);
    return Response.ok({
      message: 'Current workspace set successfully',
      data: null,
    });
  } catch (e: any) {
    log.error('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

/**
 * @deprecated Use IpcChannels.WORKSPACE_SETTINGS_FILE_INFO instead
 */
api.handle(IpcChannels.WORKSPACE_CONTEXT_FILES, async (_event, scanRoot: string) => {
  try {
    const contextFiles = await workspaceService.contextFiles(scanRoot);
    return Response.ok({
      message: 'Context files retrieved successfully',
      data: contextFiles,
    });
  } catch (e: any) {
    log.error('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

/** Search Group Items * */

// GET
api.handle(IpcChannels.WORKSPACE_GET_SEARCH_GROUP_KEYWORDS, async (_event) => {
  try {
    const groups = await workspaceService.getAllSearchGroupKeywords();
    return Response.ok({
      message: 'Groups keywords retrieved successfully',
      data: groups,
    });
  } catch (e: any) {
    log.error('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

// POST
api.handle(IpcChannels.WORKSPACE_POST_SEARCH_GROUP, async (_event, group:Array<GroupSearchKeywordDTO>) => {
  try {
    const groups = await workspaceService.addSearchGroupKeywords(group);
    return Response.ok({
      message: 'Group keywords added successfully',
      data: groups,
    });
  } catch (e: any) {
    log.error('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

// PUT
api.handle(IpcChannels.WORKSPACE_PUT_SEARCH_GROUP, async (_event, group: GroupSearchKeywordDTO) => {
  try {
    const data = await workspaceService.updateSearchGroupKeyword(group);
    return Response.ok({
      message: 'Groups keywords retrieved successfully',
      data,
    });
  } catch (e: any) {
    log.error('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

// DELETE
api.handle(IpcChannels.WORKSPACE_DELETE_SEARCH_GROUP, async (_event, id: number) => {
  try {
    const group = await workspaceService.deleteSearchGroupKeyword(id);
    return Response.ok({
      message: 'Groups keywords retrieved successfully',
      data: group,
    });
  } catch (e: any) {
    log.error('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

/**
 * @deprecated Use IpcChannels.WORKSPACE_SETTINGS_FILE_INFO instead
 */
api.handle(IpcChannels.WORKSPACE_SCANOSS_SETTING_FILE, async (_event, scanRoot: string) => {
  try {
    const scanossSettingsFilePath = await workspaceService.getScanossSettingFilePath(scanRoot);
    return Response.ok({
      message: 'Context files retrieved successfully',
      data: scanossSettingsFilePath,
    });
  } catch (e: any) {
    log.error('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

api.handle(IpcChannels.WORKSPACE_SETTINGS_FILE_INFO, async (_event, scanRoot: string) => {
  try {
    const configFileInfo = await workspaceService.getSettingsFileInfo(scanRoot);
    return Response.ok({
      message: 'Config file info retrieved successfully',
      data: configFileInfo,
    });
  } catch (e: any) {
    log.error('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});
