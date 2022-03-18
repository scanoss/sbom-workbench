import log from 'electron-log';
import { INewProject, ProjectState } from '../../../api/types';
import { licenseService } from '../../services/LicenseService';
import { modelProvider } from '../../services/ModelProvider';
import { treeService } from '../../services/TreeService';
import { workspace } from '../../workspace/Workspace';
import { Scan } from '../Scan';
import { ProjectScanHandler } from './ProjectScanHandler';

export class ProjectScan extends ProjectScanHandler {
  public async set(project: INewProject, event: Electron.WebContents): Promise<void> {
    const p = await workspace.createProject(project);
    await modelProvider.init(p.getMyPath());
    await licenseService.import();
    const tree = treeService.init(event, p.getMyPath(), p.metadata.getScanRoot());
    const summary = tree.getSummarize();
    log.transports.file.resolvePath = () => `${p.metadata.getMyPath()}/project.log`;
    p.state = ProjectState.OPENED;
    p.filesToScan = summary.files;
    p.filesSummary = summary;
    p.filesNotScanned = {};
    p.processedFiles = 0;
    p.metadata.setFileCounter(summary.include);
    p.setTree(tree);
    p.save();
    this.project = p;
    this.msgToUI = event;
  }

  public async init(): Promise<void> {
    const scan = new Scan(this.project, this.msgToUI);
    scan.init();
    scan.scan();
  }
}
