import { ipcRenderer } from 'electron';
import { projectService } from '../api/project-service';
import { componentService } from '../api/component-service';
import { ComponentGroup, ComponentParams, ComponentSource } from '../api/types';
import { sortComponents, transform } from '../utils/scan-util';
import { IpcEvents } from '../ipc-events';


const pathUtil = require('path');

export interface ScanResult {
  name: string;
  scanRoot: string;
  fileTree: any;
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

  public async getComponents(params: ComponentParams = null): Promise<ComponentGroup[]> {
    const { data } = await componentService.getAllComponentGroup({ ...params, source: ComponentSource.ENGINE });
    sortComponents(data);
    return data;
  }

  public async getComponent(purl: string, params: ComponentParams = null): Promise<ComponentGroup> {
    const { data } = await componentService.getComponentGroup({ purl }, { ...params, source: ComponentSource.ENGINE });
    return data;
  }

  public async getFileTree() {
    const tree = await projectService.getTree();
    return tree;
  }

  private async generateScanResult(data): Promise<ScanResult> {
    const tree = data.logical_tree;
    const work = data.work_root;

    // TODO: get from scan result
    const name = work.split(pathUtil.sep)[work.split(pathUtil.sep).length - 1];

    return {
      name,
      scanRoot: data.scan_root,
      fileTree: tree,
    };
  }
}

export const workbenchController = new WorkbenchController();
