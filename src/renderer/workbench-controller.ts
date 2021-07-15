import * as scanUtil from '../utils/scan-util';
import { projectService } from '../api/project-service';

const fs = require('original-fs').promises;

export interface ScanResult {
  scan: Record<string, unknown>;
  fileTree: any[];
  components: any[];
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

  private async generateScanResult(data): Promise<ScanResult> {
    const scan = data.results;
    return {
      scan,
      fileTree: [data.logical_tree],
      components: scanUtil.getComponents(scan),
    };
  }
}

export const workbenchController = new WorkbenchController();
