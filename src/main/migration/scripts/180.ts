import fs from 'fs';
import log from 'electron-log';

export async function migration180(projectPath: string): Promise<void> {
  log.info('Migration 1.8.0 In progress...');
  const dicc = await hasDictionary(projectPath);
  if (dicc) await updateDictionary(projectPath);
  log.info('Migration 1.8.0 finished...');
}

async function hasDictionary(projectPath: string): Promise<boolean> {
  try {
    await fs.promises.access(`${projectPath}/dictionary`);
    return true;
  } catch (error) {
    return false;
  }
}

async function updateDictionary(projectPath: string) {
  const files = await fs.promises.readdir(`${projectPath}/dictionary`, { withFileTypes: true });
  for (const filename of files) {
    await fs.promises.rename(`${projectPath}/dictionary/${filename.name}`, `${projectPath}/dictionary/${fileNameAdapter(filename.name)}`);
  }
}

function fileNameAdapter(filePath: string): string {
  const map : Record<string, string> = {
    'reg.cfg.json': 'cfg.json', 'reg.cfg.map.ctx.json': 'ctx.json', 'reg.cfg.map.json': 'map.json', 'reg.json': 'reg.json',
  };
  return map[filePath];
}
