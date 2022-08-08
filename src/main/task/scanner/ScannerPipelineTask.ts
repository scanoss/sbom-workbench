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
import {ResumeScanTask} from "./ResumeScanTask";

export class ScannerPipelineTask implements ITask<Scanner.ScannerConfig, boolean> {
  public async run(params: Scanner.ScannerConfig): Promise<boolean> {
    await workspace.closeAllProjects();

    // initialize project
    const project: Project =
      params.type === Scanner.ScannerType.SCAN
        ? await projectService.create(params.project) :
        params.type === Scanner.ScannerType.RESUME ? await workspace.getProject(new ProjectFilterPath(params.projectPath))
        : await workspace.getProject(new ProjectFilterPath(params.projectPath));


    // scan
    const scanTask: BaseScannerTask =
      params.type === Scanner.ScannerType.SCAN
        ? new ScanTask() : params.type === Scanner.ScannerType.RESUME ? new ResumeScanTask()
        : new ReScanTask();


    await scanTask.set(project);
    await scanTask.init();
    await scanTask.run();

    // dependencies
    await new DependencyTask(project).run();

    // vulnerabilities
    await new VulnerabilitiesTask(project).run();

    // search index
    await new IndexTask(project).run();

    await project.close();

    broadcastManager.get().send(IpcChannels.SCANNER_FINISH_SCAN, {
      success: true,
      resultsPath: project.metadata.getMyPath(),
    });

    return true;
  }
}
