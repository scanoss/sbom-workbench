import log from 'electron-log';
import { ScanState } from '../../../api/types';
import { licenseService } from '../../services/LicenseService';
import { modelProvider } from '../../services/ModelProvider';
import { rescanService } from '../../services/RescanService';
import { treeService } from '../../services/TreeService';
import { ProjectFilterPath } from '../../workspace/filters/ProjectFilterPath';
import { workspace } from '../../workspace/Workspace';
import { ScannerTask } from './ScannerTask';

export class ReScanTask extends ScannerTask {
  public async done(resultPath: string) {
    await rescanService.reScan(this.project.getTree().getRootFolder().getFiles(), resultPath, this.project.getMyPath());
    const results = await rescanService.getNewResults();
    this.project.getTree().sync(results);
    log.info(`%c[ SCANNER ]: Re-scan finished `, 'color: green');
    this.project.save();
  }

  public async set(projectPath: string): Promise<void> {
    const p = workspace.getProject(new ProjectFilterPath(projectPath));
    await p.upgrade();
    const tree = treeService.init(p.getMyPath(), p.metadata.getScanRoot());
    p.setTree(tree);
    const summary = tree.getSummarize();
    p.filesToScan = summary.files;
    p.filesSummary = summary;
    p.filesNotScanned = {};
    p.processedFiles = 0;
    p.metadata.setFileCounter(summary.include);
    p.metadata.setScannerState(ScanState.RESCANNING);
    await modelProvider.init(p.getMyPath());
    await licenseService.import();
    p.save();
    await p.open();
    this.project = p;
  }
}
