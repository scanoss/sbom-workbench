import log from 'electron-log';
import { ExtractFromProjectDTO, INewProject, IProject, Inventory, InventoryKnowledgeExtraction, LOCK, ProjectAccessMode, ProjectState, ReuseIdentificationTaskDTO } from '../../api/types';
import { Project } from '../workspace/Project';
import { workspace } from '../workspace/Workspace';
import { modelProvider } from './ModelProvider';
import { Scanner } from '../task/scanner/types';
import { userSettingService } from './UserSettingService';
import { ProjectFilterPath } from '../workspace/filters/ProjectFilterPath';
import { CodeScannerPipelineTask } from '../task/scanner/scannerPipeline/CodeScannerPipelineTask';
import { ScannerPipelineFactory } from '../task/scanner/scannerPipelineFactory/ScannerPipelineFactory';
import { ProjectKnowledgeExtractor } from '../modules/projectKnowledge/ProjectKnowledgeExtractor';
import { ReuseIdentificationTask } from '../task/reuseIdentification/ReuseIdentificationTask';
import ScannerMode = Scanner.ScannerMode;
import ScannerType = Scanner.ScannerType;
import os from 'os';
import * as util from 'util';

class ProjectService {
  private setCryptographyScanType(p: Project): void {
    if (p.getGlobalApiKey()) {
      const types = p.metadata.getScannerConfig().type;
      types.push(ScannerType.CRYPTOGRAPHY);
      const uniqueTypes = new Set(types);
      p.metadata.getScannerConfig().type = Array.from(uniqueTypes);
    } else {
      p.metadata.getScannerConfig().type.filter((t) => t !== ScannerType.CRYPTOGRAPHY);
    }
  }

  public async close(): Promise<IProject> {
    const p = workspace.getOpenProject();
    const dto = p.getDto();
    await p.close();
    return dto;
  }


  public async unlock(projectName: string) {
    const db:any = modelProvider.getWorkspaceDb;
    const call = util.promisify(db.get.bind(db));
    const projectlock = await call(`SELECT l.project, l.username, l.hostname, l.createdAt , l.updatedAt FROM lock as l WHERE l.project = ? AND l.username = ? AND l.hostname = ?;`, projectName, os.userInfo().username, os.hostname());  // filter by projectName

    // Unlock project only if user has assigned the project
    if (projectlock) {
      const sentence = util.promisify(db.run.bind(db));
      await sentence('DELETE FROM lock WHERE project = ? AND username = ? AND hostname = ?;',projectName, os.userInfo().username, os.hostname());
    }
  }

  /**
   * Validate .lock file exists before calling this function
   * @brief Lock project creating a new entry in lock table. Only locks projects in WRITE mode
   * @param projectName
   * @param mode  
   * @returns Promise<void>
   */
  public async lockProject(projectName: string, mode: ProjectAccessMode): Promise<void> {

    if (mode === ProjectAccessMode.READ_ONLY){
      log.info("Read only mode set");
      return;
    } 

    const db:any = modelProvider.getWorkspaceDb;
    const call = util.promisify(db.get.bind(db));
    const projectlock = await call(`SELECT l.project, l.username, l.hostname, l.createdAt , l.updatedAt FROM lock as l WHERE l.project = ? ;`, projectName);  // filter by projectName
  
    if (!projectlock) {
      log.info('User lock project');
      const sentence = util.promisify(db.run.bind(db));
      await sentence('INSERT INTO lock (project, username, hostname, createdAt, updatedAt) values(?,?,?,?,?);', projectName, os.userInfo().username, os.hostname(),new Date().toISOString(), new Date().toISOString())
    } else {
      log.info('Project is locked');
      const start = new Date(projectlock.updatedAt);
      const end = new Date();

      // Calculate the time difference in milliseconds
      const timeDifference = Math.abs(end.getTime() - start.getTime());

      // Convert the time difference to minutes
      const minutesDifference = Math.floor(timeDifference / (1000 * 60));

      if (minutesDifference > 1) {
        log.info(`Time lock expired ${minutesDifference}, locking project`);
        const sentence = util.promisify(db.run.bind(db));
        await sentence('UPDATE lock SET  username=? , hostname=?, createdAt=?, updatedAt=? WHERE project = ?;', os.userInfo().username, os.hostname(),new Date().toISOString(), new Date().toISOString(), projectName);
      }
    }
  }

  public async createProject(projectDTO: INewProject) {
    const p = await this.create(projectDTO);
    // Add crypto scanner config depending on API Key token
    this.setCryptographyScanType(p);
    p.save();

    await ScannerPipelineFactory.getScannerPipeline(projectDTO.scannerConfig.source).run(p);
  }

  public async reScan(projectPath: string) {
    await workspace.closeAllProjects();
    const p = await workspace.getProject(new ProjectFilterPath(projectPath));
    p.metadata.getScannerConfig().mode = Scanner.ScannerMode.RESCAN;

    // Add crypto scanner config depending on API Key token
    this.setCryptographyScanType(p);
    p.save();

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
    console.log('Create', p.getMyPath());
    await modelProvider.init(p.getMyPath());
    log.transports.file.resolvePath = () => `${p.metadata.getMyPath()}/project.log`;
    p.state = ProjectState.OPENED;
    p.save();
    return p;
  }

  private async create(projectDTO: INewProject, event: Electron.WebContents = null): Promise<Project> {
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
      // TODO: create a ScanerType filter in case some stage was not free
      /* projectDTO.scannerConfig.type = projectDTO.scannerConfig.type.filter(
        (e) => e !== ScannerType.VULNERABILITIES
      );
       */
    }
  }

  public async extractProjectKnowledgeInventoryData(param: ExtractFromProjectDTO): Promise<InventoryKnowledgeExtraction> {
    const projectKnowledgeExtractor = new ProjectKnowledgeExtractor(param);
    const inventoryKnowledgeData = await projectKnowledgeExtractor.extractInventoryData();
    return inventoryKnowledgeData;
  }

  public async acceptInventoryKnowledge(param: ReuseIdentificationTaskDTO): Promise<Array<Inventory>> {
    const inventories = await new ReuseIdentificationTask(param).run();
    return inventories;
  }
}

export const projectService = new ProjectService();
