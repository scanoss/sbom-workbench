import { ScanTask } from './ScanTask';
import { WFPDispatcher } from '../dispatcher/WFPDispatcher';
import { WFPScannerInputAdapter } from '../adapter/WFPScannerInputAdapter';
import { Project } from '../../../workspace/Project';
import { ProjectSource } from '../../../../api/types';

export class WFPScanTask extends ScanTask <WFPDispatcher, WFPScannerInputAdapter> {
  constructor(project: Project) {
    super(project, new WFPDispatcher(), new WFPScannerInputAdapter(project));
  }

  public async set(): Promise<void> {
    await super.set();
    // Override the generic SCAN label stamped by ScanTask.set() so consumers
    // (badges, export/rescan policy, migrations) can tell a winnowing-based
    // project apart from a native code scan.
    this.project.metadata.setSource(ProjectSource.WFP);
    this.project.save();
  }
}
