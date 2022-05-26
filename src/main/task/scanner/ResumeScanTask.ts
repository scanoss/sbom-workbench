import { IpcEvents } from '../../../api/ipc-events';
import { ScanState } from '../../../api/types';
import { ProjectFilterPath } from '../../workspace/filters/ProjectFilterPath';
import { Project } from '../../workspace/Project';
import { workspace } from '../../workspace/Workspace';
import { ScannerTask } from './ScannerTask';

export class ResumeScanTask extends ScannerTask {
  public async scanStateValidation() {
    const scanState: ScanState = this.project.metadata.getScannerState();
    if (scanState !== ScanState.SCANNING && scanState !== ScanState.RESCANNING)
      throw new Error('Cannot resume project');
    await this.project.open();
  }

  public scannerStatus() {
    this.sendToUI(IpcEvents.SCANNER_UPDATE_STATUS, {
      stage: {
        stageName: ScanState.SCANNING,
        stageStep: 2,
      },
      processed: (100 * this.project.processedFiles) / this.project.filesSummary.include,
    });
  }

  public async set(projectPath: string): Promise<void> {
    const p: Project = workspace.getProject(new ProjectFilterPath(projectPath));
    await p.open();
    this.project = p;
  }
}
