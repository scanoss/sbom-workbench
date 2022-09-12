import  log  from 'electron-log';
import { INewProject, ProjectState } from '../../api/types';
import { Project } from '../workspace/Project';
import { workspace } from '../workspace/Workspace';
import { modelProvider } from './ModelProvider';
import { treeService } from './TreeService';
import { Scanner } from '../task/scanner/types';

class ProjectService {
  public async create(scannerConfig: Scanner.ScannerConfig, event: Electron.WebContents = null): Promise<Project> {
    const p = await workspace.createProject(scannerConfig);
    await modelProvider.init(p.getMyPath());
    const tree = treeService.init(p.getMyPath(), p.metadata.getScanRoot());
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
    return p;
  }
}

export const projectService = new ProjectService();
