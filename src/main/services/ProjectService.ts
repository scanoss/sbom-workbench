import log from 'electron-log';
import {INewProject, ProjectState} from '../../api/types';
import {Project} from '../workspace/Project';
import {workspace} from '../workspace/Workspace';
import {modelProvider} from './ModelProvider';
import {Scanner} from '../task/scanner/types';
import {userSettingService} from './UserSettingService';
import {ProjectFilterPath} from '../workspace/filters/ProjectFilterPath';
import {CodeScannerPipelineTask} from '../task/scanner/scannerPipeline/CodeScannerPipelineTask';
import {ScannerPipelineFactory} from "../task/scanner/scannerPipelineFactory/ScannerPipelineFactory";
import ScannerType = Scanner.ScannerType;
import ScannerMode = Scanner.ScannerMode;

class ProjectService {
  public async createProject(projectDTO: INewProject) {
    const p = await this.create(projectDTO);
    await ScannerPipelineFactory.getScannerPipeline(projectDTO.scannerConfig.source).run(p);
  }

  public async reScan(projectPath: string) {
    await workspace.closeAllProjects();
    const p = await workspace.getProject(new ProjectFilterPath(projectPath));
    p.metadata.getScannerConfig().mode = Scanner.ScannerMode.RESCAN;
    await ScannerPipelineFactory.getScannerPipeline(p.metadata.getScannerConfig().source).run(p);
  }

  public async resume(projectPath: string) {
    await workspace.closeAllProjects();
    const p = await workspace.getProject(new ProjectFilterPath(projectPath));
    const scanner = new CodeScannerPipelineTask();
    p.metadata.getScannerConfig().mode = Scanner.ScannerMode.RESUME;
    await ScannerPipelineFactory.getScannerPipeline(p.metadata.getScannerConfig().source).run(p);
  }

  private async createNewProject(projectDTO: INewProject): Promise<Project> {
    const p = await workspace.createProject(projectDTO);
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
    projectDTO.scannerConfig.mode = ScannerMode.SCAN;
    await this.modeTypeFilter(projectDTO);
    const p = await this.createNewProject(projectDTO);
    return p;
  }

  private async modeTypeFilter(projectDTO: INewProject) {
    const { APIS, DEFAULT_API_INDEX } = userSettingService.get();
    const hasApiKey = projectDTO.api_key || APIS[DEFAULT_API_INDEX]?.API_KEY;

    if (!hasApiKey) {
      projectDTO.scannerConfig.type = projectDTO.scannerConfig.type.filter(
        (e) => e !== ScannerType.VULNERABILITIES
      );
    }
  }
}

export const projectService = new ProjectService();
