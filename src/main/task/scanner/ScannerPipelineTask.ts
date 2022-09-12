import { ITask } from '../Task';
import { ScanTask } from './ScanTask';
import { workspace } from '../../workspace/Workspace';
import { DependencyTask } from './DependencyTask';
import { VulnerabilitiesTask } from './VulnerabilitiesTask';
import { IndexTask } from '../search/indexTask/IndexTask';
import { projectService } from '../../services/ProjectService';
import { IpcChannels } from '../../../api/ipc-channels';
import { broadcastManager } from '../../broadcastManager/BroadcastManager';
import { BaseScannerTask } from './BaseScannerTask';
import { ReScanTask } from './ReScanTask';
import { Project } from '../../workspace/Project';
import { ProjectFilterPath } from '../../workspace/filters/ProjectFilterPath';
import { Scanner } from './types';
import { ResumeScanTask } from "./ResumeScanTask";
import ScannerType = Scanner.ScannerType;
import { userSettingService } from '../../services/UserSettingService';

export class ScannerPipelineTask implements ITask<Scanner.ScannerConfig, boolean> {
  public async run(params: Scanner.ScannerConfig): Promise<boolean> {
    await workspace.closeAllProjects();

    // initialize project
    const project: Project =
      params.mode === Scanner.ScannerMode.SCAN
        ? await projectService.create(params)
        : await workspace.getProject(new ProjectFilterPath(params.projectPath));

    // load params
    params.type = params.mode === Scanner.ScannerMode.SCAN
      ? params.type
      : project.metadata.getScannerConfig().type;

    // TODO: move this permission check from task
    this.checkTypes(params, project);

    // scan
    const scanTask: BaseScannerTask =
      params.mode === Scanner.ScannerMode.SCAN
        ? new ScanTask() :
          params.mode === Scanner.ScannerMode.RESUME
            ? new ResumeScanTask()
            : new ReScanTask();


    if (params.type.includes(ScannerType.CODE)) {
      await scanTask.set(project);
      await scanTask.init();
      await scanTask.run();
    }

    // dependencies
    if (params.type.includes(ScannerType.DEPENDENCIES)) await new DependencyTask(project).run();

    // vulnerabilities
    if (params.type.includes(ScannerType.VULNERABILITIES)) await new VulnerabilitiesTask(project).run();

    // search index
    await new IndexTask(project).run();

    await project.close();

    broadcastManager.get().send(IpcChannels.SCANNER_FINISH_SCAN, {
      success: true,
      resultsPath: project.metadata.getMyPath(),
    });

    return true;
  }

  private checkTypes(params: Scanner.ScannerConfig, project: Project) {
    const { APIS, DEFAULT_API_INDEX } = userSettingService.get();
    const hasApiKey = project.getApiKey() || APIS[DEFAULT_API_INDEX]?.API_KEY;

    if (!hasApiKey) {
      params.type = params.type.filter(e => e !== ScannerType.VULNERABILITIES)
    }
  }
}
