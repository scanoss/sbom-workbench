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
import { ResumeScanTask } from './ResumeScanTask';
import ScannerType = Scanner.ScannerType;
import { userSettingService } from '../../services/UserSettingService';
import { DecompressTask } from '../decompress/DecompressTask';

export class ScannerPipelineTask implements ITask<Project, boolean> {
  public async run(project: Project): Promise<boolean> {
    const { metadata } = project;

    // TODO: Add new scanner type
    await new DecompressTask().run(project);

    // scan
    const scanTask: BaseScannerTask =
      metadata.getScannerConfig().mode === Scanner.ScannerMode.SCAN
        ? new ScanTask()
        : metadata.getScannerConfig().mode === Scanner.ScannerMode.RESUME
        ? new ResumeScanTask()
        : new ReScanTask();

    if (metadata.getScannerConfig().type.includes(ScannerType.CODE)) {
      await scanTask.set(project);
      await scanTask.init();
      await scanTask.run();
    }

    // dependencies
    if (metadata.getScannerConfig().type.includes(ScannerType.DEPENDENCIES))
      await new DependencyTask(project).run();

    // vulnerabilities
    if (metadata.getScannerConfig().type.includes(ScannerType.VULNERABILITIES))
      await new VulnerabilitiesTask(project).run();

    // search index
    await new IndexTask(project).run();

    await project.close();

    broadcastManager.get().send(IpcChannels.SCANNER_FINISH_SCAN, {
      success: true,
      resultsPath: metadata.getMyPath(),
    });

    return true;
  }

  private checkTypes(params: Scanner.ScannerConfig, project: Project) {
    const { APIS, DEFAULT_API_INDEX } = userSettingService.get();
    const hasApiKey = project.getApiKey() || APIS[DEFAULT_API_INDEX]?.API_KEY;

    if (!hasApiKey) {
      params.type = params.type.filter(
        (e) => e !== ScannerType.VULNERABILITIES
      );
    }
  }
}
