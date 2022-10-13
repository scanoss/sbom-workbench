import log from 'electron-log';
import { INewProject, ProjectState } from '../../api/types';
import { Project } from '../workspace/Project';
import { workspace } from '../workspace/Workspace';
import { modelProvider } from './ModelProvider';
import { treeService } from './TreeService';
import { Scanner } from '../task/scanner/types';
import { userSettingService } from './UserSettingService';
import ScannerConfig = Scanner.ScannerConfig;
import ScannerType = Scanner.ScannerType;
import ScannerSource = Scanner.ScannerSource;
import { ProjectFilterPath } from '../workspace/filters/ProjectFilterPath';
import { ScannerPipelineTask } from '../task/scanner/ScannerPipelineTask';

class ProjectService {
  public async createProject(projectDTO: INewProject) {
    const p = await this.create(projectDTO);
    const scanner = new ScannerPipelineTask();
    await scanner.run(p);
  }

  public async reScan(projectPath: string) {
    await workspace.closeAllProjects();
    const p = await workspace.getProject(new ProjectFilterPath(projectPath));
    p.metadata.getScannerConfig().mode = Scanner.ScannerMode.RESCAN;
    const scanner = new ScannerPipelineTask();
    await scanner.run(p);
  }

  public async resume(projectPath: string) {
    await workspace.closeAllProjects();
    const p = await workspace.getProject(new ProjectFilterPath(projectPath));
    const scanner = new ScannerPipelineTask();
    p.metadata.getScannerConfig().mode = Scanner.ScannerMode.RESUME;
    await scanner.run(p);
  }

  private async createNewProject(
    scannerConfig: Scanner.ScannerConfig
  ): Promise<Project> {
    const p = await workspace.createProject(scannerConfig);
    await modelProvider.init(p.getMyPath());
    log.transports.file.resolvePath = () =>
      `${p.metadata.getMyPath()}/project.log`;
    p.state = ProjectState.OPENED;
    p.save();
    return p;
  }

  private async create(
    projectDTO: INewProject,
    event: Electron.WebContents = null
  ): Promise<Project> {
    await workspace.closeAllProjects();
    // TODO: Add scannerConfig into INewProject
    const scannerConfig = {
      unzip: false,
      mode: Scanner.ScannerMode.SCAN,
      source: ScannerSource.CODE,
      type: [
        ScannerType.CODE,
        ScannerType.DEPENDENCIES,
        ScannerType.VULNERABILITIES,
      ],
      project: projectDTO,
    };
    await this.modeTypeFilter(scannerConfig);
    const p = await this.createNewProject(scannerConfig);
    return p;
  }

  private async modeTypeFilter(scannerConfig: ScannerConfig) {
    const { APIS, DEFAULT_API_INDEX } = userSettingService.get();
    const hasApiKey =
      scannerConfig.project.api_key || APIS[DEFAULT_API_INDEX]?.API_KEY;

    if (!hasApiKey) {
      scannerConfig.type = scannerConfig.type.filter(
        (e) => e !== ScannerType.VULNERABILITIES
      );
    }
  }
}

export const projectService = new ProjectService();
