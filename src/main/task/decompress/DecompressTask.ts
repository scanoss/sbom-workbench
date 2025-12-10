import log from 'electron-log';
import { app, utilityProcess } from 'electron';
import { DecompressionManager } from 'scanoss';
import path from 'path';
import { Project } from '../../workspace/Project';
import { Scanner } from '../scanner/types';
import { ScannerStage } from '../../../api/types';

export class DecompressTask implements Scanner.IPipelineTask {
  private project: Project;

  private decompressionManager: DecompressionManager;

  constructor(project: Project) {
    this.project = project;
    this.decompressionManager = new DecompressionManager();
  }

  public getStageProperties(): Scanner.StageProperties {
    return {
      name: ScannerStage.UNZIP,
      label: 'Decompressing files',
      isCritical: true,
    };
  }

  public run(): Promise<boolean> {
    log.info('[ DecompressTask init ]');

    const RESOURCES_PATH = app.isPackaged
     ? path.join(__dirname, 'scanner.js')
     : path.join(app.getAppPath(), '.erb/dll/scanner.js');

   const child = utilityProcess.fork(RESOURCES_PATH, [], { stdio: "pipe" });

   child.stdout.on ("data", (data) => {
     log.info(`%c[ THREAD ]: Decompress Thread `, 'color: green', data.toString());
   });

   child.postMessage({ action: 'DECOMPRESS', data: this.project.getScanRoot() });

   return new Promise((resolve, reject) => {
     child.on('message', (data) => {
       log.info(`%c[ THREAD ]: Decompress Thread `, 'color: green', data.toString());
       if (data.event === 'success'){
         resolve(true);
       }
       if(data.event === 'error'){
         reject(new Error(data.error));
       }
       reject(new Error(`Decompress task failed`));
       child.kill();
     });
   });
  }

}
