const fs = require('original-fs').promises;

export interface ScanResult {
  id: string;
  fileTree: [];
  scan: Record<string, unknown>;
}

function getFileTree(scan: Record<string, unknown>) {
  const result: any[] = [];
  const level = { result };

  Object.keys(scan).forEach((file) => {
    const path: string[] = [];
    file.split('/').reduce((r, name, i, a) => {
      path.push(name);
      const value = path.join('/');
      if (!r[name]) {
        // orig r[name]
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

function resultFromScan(data: string): ScanResult {
  const scan = JSON.parse(data);

  return {
    id: '0',
    fileTree: getFileTree(scan),
    scan,
  };
}

export async function loadScan(path: string): Promise<ScanResult> {
  const data = await fs.readFile(path, 'utf-8');
  return resultFromScan(data);
}

export default {
  loadScan,
};
