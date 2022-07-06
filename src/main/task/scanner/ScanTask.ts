import log from 'electron-log';

import { INewProject, ProjectState, ScanState } from '../../../api/types';
import { ScannerTask } from './ScannerTask';
import { workspace } from '../../workspace/Workspace';
import { modelProvider } from '../../services/ModelProvider';
import { licenseService } from '../../services/LicenseService';
import { treeService } from '../../services/TreeService';

export class ScanTask extends ScannerTask {
  public async set(project: INewProject): Promise<void> {
    await workspace.closeAllProjects();
    const p = await workspace.createProject(project);
    await modelProvider.init(p.getMyPath());
    await licenseService.import();
    const tree = treeService.init(p.getMyPath(), p.metadata.getScanRoot());
    const summary = tree.getSummarize();
    log.transports.file.resolvePath = () => `${p.metadata.getMyPath()}/project.log`;
    p.state = ProjectState.OPENED;
    p.filesToScan = summary.files;
    p.filesSummary = summary;
    p.filesNotScanned = {};
    p.processedFiles = 0;
    p.metadata.setFileCounter(summary.include);
    p.metadata.setScannerState(ScanState.SCANNING);
    p.setTree(tree);
    p.save();
    this.project = p;
  }
}
