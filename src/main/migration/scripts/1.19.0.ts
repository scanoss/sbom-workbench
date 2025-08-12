import log from 'electron-log';
import fs from 'fs';

export async function projectMigration1190(projectPath:string): Promise<void> {
  try {
    log.info('%cApp Migration 1.19.0 in progress...', 'color:green');
    await addSourceCodePathToMetadata(projectPath);
    log.info('%cApp Migration 1.19.0 finished', 'color:green');
  } catch (e: any) {
    log.error(e);
  }
}

async function addSourceCodePathToMetadata(projectPath: string) {
  const m = await fs.promises.readFile(`${projectPath}/metadata.json`, 'utf8');
  const metadata = JSON.parse(m);
  metadata.sourceCodePath = '';
  if(metadata.scan_root && !metadata.scan_root.endsWith('.wfp')) {
    metadata.sourceCodePath = metadata.scan_root;
  }
  await fs.promises.writeFile(`${projectPath}/metadata.json`, JSON.stringify(metadata), 'utf-8');
}
