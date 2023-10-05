import { projectService } from '@api/services/project.service';
import { componentService } from '@api/services/component.service';
import { ComponentGroup, ComponentSource, IWorkbenchFilterParams } from '@api/types';
import { sortComponents } from '@shared/utils/scan-util';
import { IpcChannels } from '@api/ipc-channels';
import AppConfig from '../../config/AppConfigModule';
import { Scanner } from '../../main/task/scanner/types';

export interface ScanResult {
  name: string;
  imported: boolean;
  scanRoot: string;
  projectRoot: string;
  fileTree: any;
  dependencies: Array<string>;
  config: Scanner.ScannerConfig;
}

export interface ProjectSettings {
  api_url: string;
  api_key: string;
}

class WorkbenchController {
  /**
   * Open scan file result
   *
   * @param {string} path
   * @returns {Promise<ScanResult>}
   * @memberof WorkbenchController
   */
  public async loadScan(path: string): Promise<ScanResult> {
    const { data } = await projectService.load(path);
    return this.generateScanResult(data);
  }

  public async loadSettings(): Promise<ProjectSettings> {
    const api_url = await projectService.getApiURL();
    const api_key = await projectService.getApiKey();

    return { api_key, api_url };
  }

  /**
   * Get file content from a local file
   *
   * @param {string} path
   * @returns {string}
   * @memberof WorkbenchController
   */
  public async fetchLocalFile(path: string): Promise<string> {
    const { data } = await window.electron.ipcRenderer.invoke(IpcChannels.FILE_GET_CONTENT, path);
    return data.content;
  }

  /**
   * Get file content from a remote file
   *
   * @param {string} hash
   * @param {ProjectSettings} config
   * @memberof WorkbenchController
   */
  public async fetchRemoteFile(hash: string, config: ProjectSettings = null): Promise<string> {
    const URL = (config?.api_url || AppConfig.API_URL);

    const response = await fetch(`${URL}${AppConfig.API_CONTENT_PATH}/${hash}`, {
      headers: {
        ...(config?.api_key && { 'X-Session': config.api_key }),
      },
    });

    if (!response.ok) throw new Error(await response.text());

    return response.text();
  }

  public async getComponents(params: IWorkbenchFilterParams = null): Promise<ComponentGroup[]> {
    const components = await componentService.getAll({
      ...params,
      filter: { ...params?.filter, source: ComponentSource.ENGINE },
    });
    sortComponents(components);
    return components;
  }

  public async getComponent(purl: string, params: IWorkbenchFilterParams = null): Promise<ComponentGroup> {
    const comp = await componentService.get(
      { purl },
      { ...params, filter: { ...params?.filter } },
    );
    return comp;
  }

  public async getFileTree() {
    const tree = await projectService.getTree();
    return tree;
  }

  private async generateScanResult(data): Promise<ScanResult> {
    const tree = data.logical_tree;
    const work = data.work_root;
    const { dependencies } = data;
    const imported = data.source === 'IMPORTED';

    return {
      name: data.metadata.name,
      imported,
      scanRoot: data.scan_root,
      projectRoot: work,
      fileTree: tree,
      dependencies,
      config: data.metadata.scannerConfig,
    };
  }
}

export const workbenchController = new WorkbenchController();
