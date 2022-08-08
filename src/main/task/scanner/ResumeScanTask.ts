import { IpcChannels } from '../../../api/ipc-channels';
import { ScanState } from '../../../api/types';
import { ProjectFilterPath } from '../../workspace/filters/ProjectFilterPath';
import { Project } from '../../workspace/Project';
import { workspace } from '../../workspace/Workspace';
import { BaseScannerTask } from './BaseScannerTask';

export class ResumeScanTask extends BaseScannerTask {
  public async set(p: Project): Promise<void> {
    await p.open();
    const scanState: ScanState = p.metadata.getScannerState();
    if (scanState !== ScanState.SCANNING && scanState !== ScanState.RESCANNING)  throw new Error('Cannot resume project');
    this.project = p;
  }
}
