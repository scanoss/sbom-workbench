import os from 'os';
import * as util from 'util';
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

class ProjectService {

  public async close(): Promise<IProject> {
    const p = workspace.getOpenProject();
    if (!p) {
      log.info('[ProjectService.close]: No project open, skipping close');
      return null;
    }
    const dto = p.getDto();
    await p.close();
    return dto;
  }

  public async unlock(projectName: string) {
    const db:any = modelProvider.workspace;
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

    const db:any = modelProvider.workspace;
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
    p.save();
    await ScannerPipelineFactory.getScannerPipeline(projectDTO.scannerConfig.source).run(p);
  }

  /**
   * Rescans an existing project by re-running the scanner pipeline in RESCAN mode.
   * This method closes all currently open projects, loads the specified project,
   * configures it for rescanning (including cryptography scanning if API key is available),
   * and executes the appropriate scanner pipeline. If the scan fails, it ensures
   * the project remains in a consistent state.
   *
   * @param projectPath - Absolute path to the project directory to rescan
   * @throws {Error} Re-throws any scanning errors after ensuring project consistency
   */
  public async reScan(projectPath: string) {
      await workspace.closeAllProjects();
      const p = await workspace.getProject(new ProjectFilterPath(projectPath));
      p.metadata.getScannerConfig().mode = Scanner.ScannerMode.RESCAN;
      // Add crypto scanner config depending on API Key token
      // this.setCryptographyScanType(p);
      // Save only metadata to avoid overwriting the filetree with an empty new one
      // Using p.save() would overwrite the entire project including the filetree
      p.metadata.save();
      try {
        await ScannerPipelineFactory.getScannerPipeline(p.metadata.getScannerConfig().source).run(p);
      } catch (e) {
        // If scanning fails, ensure the project is properly opened and saved
        // This maintains project integrity even when the rescan operation fails
        await p.open()
        p.save()
        await p.close();
        throw e
      }
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
