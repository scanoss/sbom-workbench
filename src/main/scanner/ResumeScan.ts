import  log  from 'electron-log';
import { ScanState } from '../../api/types';
import { Project } from '../workspace/Project';
import { Scan } from './Scan';

export class ResumeScan extends Scan {
  public async scanStateValidation() {
    const scanState: ScanState = this.project.metadata.getScannerState();
    console.log('scanStateValidation', scanState);
    if (scanState !== ScanState.SCANNING && scanState !== ScanState.RESCANNING)
      throw new Error('Cannot resume project');

    await this.project.open();
    
   
    log.info(`%c[ SCANNER ]: Start scanning dependencies`, 'color: green');
  //  await this.scanDependencies();
  }
}
