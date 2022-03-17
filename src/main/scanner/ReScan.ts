import log from 'electron-log';
import { ScanState } from '../../api/types';
import { rescanService } from '../services/RescanService';
import { Project } from '../workspace/Project';
import { Scan } from './Scan';

export class ReScan extends Scan {
  constructor(project: Project, msgToUI: Electron.WebContents) {
    super(project, msgToUI);
    this.project.metadata.setScannerState(ScanState.RESCANNING);
  }

  public async done(resultPath: string) {
    log.info(`%c[ SCANNER ]: Re-scan finished `, 'color: green');
    await rescanService.reScan(this.project.getTree().getRootFolder().getFiles(), resultPath);
    const results = await rescanService.getNewResults();
    this.project.getTree().sync(results);
    this.project.save();
  }
}
