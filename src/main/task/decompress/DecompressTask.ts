import log from 'electron-log';
import { app, utilityProcess } from 'electron';
import { DecompressionManager } from 'scanoss';
import path from 'path';
import { Project } from '../../workspace/Project';
import { Scanner, StageReport } from '../scanner/types';
import { ScannerStage } from '../../../api/types';

export class DecompressTask implements Scanner.IPipelineTask {
  private project: Project;
  private decompressTaskReport: StageReport = {
    title: 'Decompress',
    stage: ScannerStage.UNZIP,
    entries: [],
  };

  private decompressionManager: DecompressionManager;

  constructor(project: Project) {
    this.project = project;
    this.decompressionManager = new DecompressionManager();
  }

  public getStageProperties(): Scanner.StageProperties {
    return {
      name: ScannerStage.UNZIP,
      label: 'Decompressing files',
      isCritical: false,
      stageReport: this.decompressTaskReport,
    };
  }

  public run(): Promise<boolean> {
    log.info('[ DecompressTask init ]');

    const RESOURCES_PATH = app.isPackaged
      ? path.join(__dirname, 'scanner.js')
      : path.join(app.getAppPath(), '.erb/dll/scanner.js');

    const child = utilityProcess.fork(RESOURCES_PATH, [], { stdio: 'pipe' });

    child.stdout.on('data', (data: Buffer) => {
      log.info(`[ THREAD stdout ]:`, data.toString());
    });

    child.stderr.on('data', (data: Buffer) => {
      log.error(`[ THREAD stderr ]:`, data.toString());
    });

    const scannerConfig = this.project.metadata.getScannerConfig();
    child.postMessage({
      action: 'DECOMPRESS',
      data: {
        scanRoot: this.project.getScanRoot(),
        recursive: scannerConfig.recursiveDecompress ?? false,
        maxDepth: scannerConfig.maxDecompressDepth ?? 1,
      },
    });

    return new Promise((resolve, reject) => {
      child.on('exit', (code) => {
        log.info(`[ THREAD exit ]: code=${code}`);
        if (code !== 0 && code !== null) {
          reject(new Error(`Decompress utility process exited with code ${code}`));
        }
      });

      child.on('message', (data) => {
        if (data.event === 'success') {
          child.kill();
          return resolve(true);
        }

        if (data.event === 'error') {
          const parsedData = JSON.parse(data.error);
          parsedData.failedFiles.forEach((file) => {
            this.decompressTaskReport.entries.push({
              item: file.path,
              message: file.error,
            });
          });
          parsedData.skippedByDepth.forEach((file) => {
            this.decompressTaskWarning.errors.push({
              item: file.path,
              message: file.error,
            });
          });
          child.kill();
          return reject(new Error(data.error));
        }

        child.kill();
        reject(new Error(`Decompress task failed: unknown event '${data.event}'`));
      });
    });
  }
}
