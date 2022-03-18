import { licenseService } from '../../services/LicenseService';
import { modelProvider } from '../../services/ModelProvider';
import { treeService } from '../../services/TreeService';
import { ProjectFilterPath } from '../../workspace/filters/ProjectFilterPath';
import { workspace } from '../../workspace/Workspace';
import { ReScan } from '../scanHandler/ReScan';
import { ProjectScanHandler } from './ProjectScanHandler';

export class ProjectReScan extends ProjectScanHandler {
  public async set(projectPath: string, event: Electron.WebContents): Promise<void> {
    const p = workspace.getProject(new ProjectFilterPath(projectPath));
    await p.upgrade();
    const tree = treeService.init(event, p.getMyPath(), p.metadata.getScanRoot());
    p.setTree(tree);
    const summary = tree.getSummarize();
    p.filesToScan = summary.files;
    p.filesSummary = summary;
    p.filesNotScanned = {};
    p.processedFiles = 0;
    p.metadata.setFileCounter(summary.include);
    await modelProvider.init(p.getMyPath());
    await licenseService.import();
    this.project = p;
    this.msgToUI = event;
  }

  public async init(): Promise<void> {
    const reScan = new ReScan(this.project, this.msgToUI);
    reScan.init();
    reScan.scan();
  }
}
