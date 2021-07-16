import { projectService } from '../api/project-service';
import { componentService } from '../api/component-service';
import { Component } from '../api/types';

const fs = require('original-fs').promises;

export interface ScanResult {
  scan: Record<string, unknown>;
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
    console.log(data);

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
    const data = await fs.readFile(path, 'utf-8');
    return data;
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

  public async getComponents(): Promise<Component[]> {
    const response = await componentService.getAll({});
    console.log('COMPONENTS', response.data);
    return response.data;
  }

  public async getComponent(id: number): Promise<Component> {
    const response = await componentService.get({compid: id});
    console.log('COMPONENT', response.data);
    return response.data;
  }

  private async generateScanResult(data): Promise<ScanResult> {
    const scan = data.results;
    return {
      scan,
      scanRoot: data.scan_root,
      fileTree: [data.logical_tree],
    };
  }
}

export const workbenchController = new WorkbenchController();
