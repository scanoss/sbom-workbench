import { BrowserWindow, RelaunchOptions, app } from 'electron';
import { GroupSearchKeywordDTO } from '@api/dto';
import { userSettingService } from './UserSettingService';
import { getContextFiles, getScanossSettingsFilePath, getSettingsFileInfo } from './utils/workspace';
import { modelProvider } from './ModelProvider';
import { SettingsFileInfo, GroupSearchKeyword } from '../../api/types';

class WorkspaceService {
  public async setCurrent(wsPath: string): Promise<void> {
    const workspaceConfig = userSettingService.get();
    const workspaceIndex = workspaceConfig.WORKSPACES.findIndex((w) => w.PATH === wsPath);
    // If workspace path not exists , set default workspace
    if (workspaceIndex < 0) throw new Error('Workspace not found');

    userSettingService.set({ ...workspaceConfig, DEFAULT_WORKSPACE_INDEX: workspaceIndex });
    await userSettingService.save();

    const options: RelaunchOptions = {
      args: process.argv.slice(1).concat(['--relaunch']),
      execPath: process.execPath,
    };

    if (process.env.APPIMAGE) {
      options.execPath = process.env.APPIMAGE;
      options.args.unshift('--appimage-extract-and-run');
    }

    app.relaunch(options);
    app.exit(0);
  }

  public async contextFiles(scanRoot: string) {
    return getContextFiles(scanRoot);
  }

  public async getAllSearchGroupKeywords(): Promise<Array<GroupSearchKeyword>> {
    await modelProvider.workspace.openDb();
    const groups = modelProvider.workspace.groupKeywoard.getAll();
    await modelProvider.workspace.destroy();
    return groups;
  }

  public async addSearchGroupKeywords(groups: Array<GroupSearchKeywordDTO>): Promise<Array<GroupSearchKeyword>> {
    await modelProvider.workspace.openDb();
    await modelProvider.workspace.groupKeywoard.addMany(groups);
    const newGroups = await modelProvider.workspace.groupKeywoard.getAll();
    await modelProvider.workspace.destroy();
    return newGroups;
  }

  public async updateSearchGroupKeyword(group: GroupSearchKeywordDTO): Promise<Array<GroupSearchKeyword>> {
    await modelProvider.workspace.openDb();
    const newGroups = await modelProvider.workspace.groupKeywoard.update(group);
    await modelProvider.workspace.destroy();
    return newGroups;
  }

  public async deleteSearchGroupKeyword(id: number): Promise<GroupSearchKeyword> {
    await modelProvider.workspace.openDb();
    const deletedGroup = await modelProvider.workspace.groupKeywoard.get(id);
    const newGroups = modelProvider.workspace.groupKeywoard.delete(id);
    await modelProvider.workspace.destroy();
    return deletedGroup;
  }

  /**
   * @deprecated Use getSettingsFileInfo() instead
   */
  public async getScanossSettingFilePath(scanRoot: string): Promise<string> {
    return getScanossSettingsFilePath(scanRoot);
  }

  public async getSettingsFileInfo(scanRoot: string): Promise<SettingsFileInfo> {
    return getSettingsFileInfo(scanRoot);
  }
}

export const workspaceService = new WorkspaceService();
