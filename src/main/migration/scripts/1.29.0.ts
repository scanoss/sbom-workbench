import log from 'electron-log';
import fs from 'fs';

export async function projectMigration1290(projectPath:string): Promise<void> {
  try {
    log.info('%cApp Migration 1.29.0 in progress...', 'color:green');
    await addSourceCodePathToMetadata(projectPath);
    log.info('%cApp Migration 1.29.0 finished', 'color:green');
  } catch (e: any) {
    log.error(e);
  }
}

async function addSourceCodePathToMetadata(projectPath: string) {
  const m = await fs.promises.readFile(`${projectPath}/metadata.json`, 'utf8');
  const metadata = JSON.parse(m);
  metadata.scannerConfig.pipelineStages =  metadata.scannerConfig.type;
  delete metadata.scannerConfig.type;
  await fs.promises.writeFile(`${projectPath}/metadata.json`, JSON.stringify(metadata), 'utf-8');
}
