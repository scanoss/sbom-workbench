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

  /**
   * Get file content from a local file
   *
   * @param {string} path
   * @returns {string}
   * @memberof WorkbenchController
   */
  public async fetchLocalFile(path: string): Promise<string> {
    path = '/home/franco/Desktop/scanoss/datasets/190.json';
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

  private resultFromScan(data: string): ScanResult {
    const scan = JSON.parse(data);

    return {
      id: '0',
      fileTree: this.generateFileTree2(scan),
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
            className: 'test',
            children: r[name].result,
          });
        }

        return r[name];
      }, level);
    });

    return !result[0].value && result[0].children;
  }

  private generateFileTree2(scan: Record<string, unknown>) {
    const obj = {};
    Object.keys(scan).forEach((p) =>
      p.split('/').reduce((o, name) => (o[name] = o[name] || {}), obj)
    );

    if ('' in obj) {
      delete Object.assign(obj, { '/': obj[''] })[''];
    }

    const convert = (o, parent) =>
      Object.keys(o).map((key) => {
        const p = parent
          ? parent === '/'
            ? `${parent}${key}`
            : `${parent}/${key}`
          : key;

        return Object.keys(o[key]).length
          ? {
              label: this.getLabelMatchesCount(key, parent, 'folder'),
              children: convert(o[key], p),
              type: 'folder',
              value: p,
              showCheckbox: false,
            }
          : {
              label: key,
              type: 'file',
              value: p,
              showCheckbox: false,
            };
      });

    const result = convert(obj, null);
    // return !result[0].value && result[0].children;
    return result;
  }

  private getLabelMatchesCount(label, value, type) {
    // TODO: ver matches

    /* const matches = codetree.filter(
      (f) => f.path.includes(value) && f.results > 0
    );
    if (matches.length > 0) {
      return `${label}(${matches.length})`;
    } */

    return label;
  }
}

export const workbenchController = new WorkbenchController();
