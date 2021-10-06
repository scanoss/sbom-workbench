import { ipcRenderer } from 'electron';
import { projectService } from '../api/project-service';
import { componentService } from '../api/component-service';
import { ComponentGroup } from '../api/types';
import { sortComponents, transform } from '../utils/scan-util';
import { IpcEvents } from '../ipc-events';
import { ComponentSource } from '../main/db/scan_component_db';

export interface ScanResult {
  name: string;
  scanRoot: string;
  fileTree: any[];
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

  /**
   * Get file content from a local file
   *
   * @param {string} path
   * @returns {string}
   * @memberof WorkbenchController
   */
  public async fetchLocalFile(path: string): Promise<string> {
    console.log(path)
    const { data } = await ipcRenderer.invoke(IpcEvents.FILE_GET_CONTENT, path);
    return data.content;
  }

  /**
   * Get file content from a remote file
   *
   * @param {string} hash
   * @returns {string}
   * @memberof WorkbenchController
   */
  public async fetchRemoteFile(hash: string): Promise<string> {
    // TODO: move api url to API Config
    const response = await fetch(`https://osskb.org/api/file_contents/${hash}`);
    if (!response.ok) throw new Error('File not found');

    return response.text();
  }

  public async getComponents(): Promise<ComponentGroup[]> {
    const { data } = await componentService.getAllComponentGroup({ source: ComponentSource.ENGINE });
    console.log(data);
    sortComponents(data);
    return data;
  }

  public async getComponent(purl: string): Promise<ComponentGroup> {
    const { data } = await componentService.getComponentGroup({ purl });
    return data;
  }

  private async generateScanResult(data): Promise<ScanResult> {
    const tree = [data.logical_tree];
    const path = data.scan_root;

    // TODO: get from scan result
    let name = '';
    try {
      name = path.split('/')[path.split('/').length - 1];
    } catch (e) {
      console.log(e);
    }

    return {
      name,
      scanRoot: data.scan_root,
      fileTree: tree,
    };
  }
}

export const workbenchController = new WorkbenchController();
