import log from 'electron-log';
import fs from 'fs';
import { Scanner } from '../../task/scanner/types';
import PipelineStage = Scanner.PipelineStage;
import ScannerSource = Scanner.ScannerSource;


export async function projectMigration1290(projectPath:string): Promise<void> {
  try {
    log.info('%cApp Migration 1.29.0 in progress...', 'color:green');
    await replaceScannerConfigTypeByPipelineStages(projectPath);
    log.info('%cApp Migration 1.29.0 finished', 'color:green');
  } catch (e: any) {
    log.error(e);
  }
}

async function replaceScannerConfigTypeByPipelineStages(projectPath: string) {
  const m = await fs.promises.readFile(`${projectPath}/metadata.json`, 'utf8');
  const metadata = JSON.parse(m);
  metadata.scannerConfig.pipelineStages =  metadata.scannerConfig.type;
  delete metadata.scannerConfig.type;
  // Only includes search index if the source is code
  if (metadata.scannerConfig.source === ScannerSource.CODE) {
    metadata.scannerConfig.pipelineStages.push(PipelineStage.SEARCH_INDEX)
  }
  await fs.promises.writeFile(`${projectPath}/metadata.json`, JSON.stringify(metadata), 'utf-8');
}

