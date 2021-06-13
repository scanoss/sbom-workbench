const fs = require('original-fs').promises;

export interface ScanResult {
  id: string;
  fileTree: [];
  scan: Record<string, unknown>;
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
    const data = await fs.readFile(path, 'utf-8');
    return this.resultFromScan(data);
  }

  private resultFromScan(data: string): ScanResult {
    const scan = JSON.parse(data);

    return {
      id: '0',
      fileTree: this.generateFileTree(scan),
      scan,
    };
  }

  private generateFileTree(scan: Record<string, unknown>) {
    const result: any[] = [];
    const level = { result };

    Object.keys(scan).forEach((file) => {
      const path: string[] = [];
      file.split('/').reduce((r, name, i, a) => {
        path.push(name);
        const value = path.join('/');
        if (!r[name]) {
          r[name] = { result: [] };
          r.result.push({
            label: name,
            value,
            children: r[name].result,
          });
        }

        return r[name];
      }, level);
    });

    return !result[0].value && result[0].children;
  }
}

export const workbenchController = new WorkbenchController();
